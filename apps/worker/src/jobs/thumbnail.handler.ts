import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Pool } from 'pg';
import sharp from 'sharp';

export async function handleThumbnail(pool: Pool, s3: S3Client, bucket: string, photoId: string): Promise<void> {
  const photo = await pool.query<{
    id: string;
    project_id: string;
    inspection_point_id: string;
    storage_key: string | null;
    status: string;
    thumbnail_key: string | null;
  }>(
    `SELECT id, project_id, inspection_point_id, storage_key, status, thumbnail_key FROM photos WHERE id = $1`,
    [photoId],
  );
  const row = photo.rows[0];
  if (!row) {
    throw new Error(`photo ${photoId} missing`);
  }
  if (row.status === 'ready' && row.thumbnail_key) {
    return;
  }
  if (!row.storage_key) {
    throw new Error('photo has no storage_key');
  }

  const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: row.storage_key }));
  const bytes = await obj.Body?.transformToByteArray();
  if (!bytes) {
    throw new Error('empty object');
  }
  const thumb = await sharp(Buffer.from(bytes))
    .rotate()
    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const thumbKey = `thumbs/${row.project_id}/${row.inspection_point_id}/${row.id}_512.jpg`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbKey,
      Body: thumb,
      ContentType: 'image/jpeg',
    }),
  );
  await pool.query(
    `UPDATE photos SET thumbnail_key = $2, status = 'ready', updated_at = now() WHERE id = $1`,
    [row.id, thumbKey],
  );
  await pool.query(`UPDATE inspection_points SET updated_at = now() WHERE id = $1`, [
    row.inspection_point_id,
  ]);
}
