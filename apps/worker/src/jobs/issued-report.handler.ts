import { randomUUID } from 'node:crypto';
import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import type { Pool } from 'pg';
import { escapeHtml } from './html';
import { renderPdf } from './pdf-renderer';

export async function renderIssuedReport(
  pool: Pool,
  s3: S3Client,
  bucket: string,
  report: {
    id: string;
    project_id: string;
    client_revision: number;
    status: string;
    filters_json: {
      project: string;
      issued_at: string;
      findings: {
        id: string;
        summary: string;
        category: string;
        image: string;
      }[];
    };
  },
) {
  if (report.status === 'ready') return;
  const snapshot = report.filters_json;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;font-size:12px;color:#172d22}
    article{break-inside:avoid;margin:24px 0}img{max-width:100%;max-height:420px}p{white-space:pre-wrap;overflow-wrap:anywhere}
  </style></head><body><h1>${escapeHtml(snapshot.project)}</h1>
  <p>Issued revision ${report.client_revision} · ${escapeHtml(snapshot.issued_at)}</p>
  ${snapshot.findings
    .map(
      (
        f,
      ) => `<article><h2>${escapeHtml(f.category)}</h2><p>${escapeHtml(f.summary)}</p>
    <img src="${escapeHtml(f.image)}"><p>Finding ${escapeHtml(f.id)}</p></article>`,
    )
    .join('')}
  </body></html>`;
  const bytes = await renderPdf(html);
  const key = `reports/${report.project_id}/${report.id}-${randomUUID()}.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: 'application/pdf',
    }),
  );
  await pool.query(
    `UPDATE reports SET status='ready',storage_key=$2,generated_at=now(),error_message=NULL,updated_at=now()
    WHERE id=$1 AND status IN ('queued','processing')`,
    [report.id, key],
  );
}
