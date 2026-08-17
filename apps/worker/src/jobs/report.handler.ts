import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Pool } from 'pg';
import { buildReportHtml, type ReportPointRow } from './html';
import { renderPdf } from './pdf-renderer';

const POINT_CAP = 200;

export async function handleReport(
  pool: Pool,
  s3: S3Client,
  bucket: string,
  reportId: string,
): Promise<void> {
  const header = await pool.query<{
    id: string;
    project_id: string;
    project_name: string;
    requested_by_name: string;
  }>(
    `SELECT r.id, r.project_id, p.name AS project_name, u.full_name AS requested_by_name
     FROM reports r
     JOIN projects p ON p.id = r.project_id
     JOIN users u ON u.id = r.requested_by
     WHERE r.id = $1`,
    [reportId],
  );
  const meta = header.rows[0];
  if (!meta) throw new Error(`report ${reportId} missing`);

  const points = await pool.query<{
    captured_at: Date;
    latitude: string;
    longitude: string;
    accuracy_m: number | null;
    category: string;
    status: string;
    note: string | null;
    remarks: string | null;
    recommended_procedure: string | null;
    inspector_name: string | null;
    thumbnail_key: string | null;
  }>(
    `SELECT ip.captured_at, ip.latitude, ip.longitude, ip.accuracy_m, ip.category, ip.status,
            ip.note, ip.remarks, ip.recommended_procedure, u.full_name AS inspector_name,
            ph.thumbnail_key
     FROM inspection_points ip
     LEFT JOIN users u ON u.id = ip.inspector_id
     LEFT JOIN photos ph ON ph.inspection_point_id = ip.id
     WHERE ip.project_id = $1 AND ip.deleted_at IS NULL
     ORDER BY ip.captured_at DESC`,
    [meta.project_id],
  );
  if (points.rowCount && points.rowCount > POINT_CAP) {
    throw new Error(`point cap ${POINT_CAP} exceeded`);
  }

  const rows: ReportPointRow[] = [];
  let defect = 0;
  let normal = 0;
  let note = 0;
  let openDefects = 0;
  for (const p of points.rows) {
    if (p.category === 'defect') {
      defect += 1;
      if (p.status === 'open') openDefects += 1;
    } else if (p.category === 'normal') normal += 1;
    else if (p.category === 'note') note += 1;
    rows.push({
      captured_at: new Date(p.captured_at).toISOString(),
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      accuracy_m: p.accuracy_m,
      category: p.category,
      status: p.status,
      note: p.note,
      remarks: p.remarks,
      recommended_procedure: p.recommended_procedure,
      inspector_name: p.inspector_name,
      thumb_data_uri: await thumbUri(s3, bucket, p.thumbnail_key),
    });
  }

  const html = buildReportHtml({
    projectName: meta.project_name,
    generatedBy: meta.requested_by_name,
    generatedAt: new Date().toISOString(),
    counts: { defect, normal, note, openDefects },
    points: rows,
  });
  const pdf = await renderPdf(html);
  const key = `reports/${meta.project_id}/${meta.id}.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: pdf,
      ContentType: 'application/pdf',
    }),
  );
  await pool.query(
    `UPDATE reports
     SET status = 'ready', storage_key = $2, point_count = $3, generated_at = now(),
         error_message = NULL, updated_at = now()
     WHERE id = $1`,
    [meta.id, key, rows.length],
  );
}

async function thumbUri(s3: S3Client, bucket: string, key: string | null): Promise<string | null> {
  if (!key) return null;
  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const bytes = await obj.Body?.transformToByteArray();
    if (!bytes) return null;
    return `data:image/jpeg;base64,${Buffer.from(bytes).toString('base64')}`;
  } catch {
    return null;
  }
}
