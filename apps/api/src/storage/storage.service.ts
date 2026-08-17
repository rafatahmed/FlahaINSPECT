import { Injectable } from '@nestjs/common';
import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CopyObjectCommand } from '@aws-sdk/client-s3';

const SIGNED_TTL_SECONDS = 600;

@Injectable()
export class StorageService {
  private readonly client: S3Client | null;
  private readonly bucket: string | null;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    this.bucket = process.env.S3_BUCKET ?? null;
    this.client =
      endpoint && accessKeyId && secretAccessKey
        ? new S3Client({
            region: process.env.S3_REGION ?? 'us-east-1',
            endpoint,
            credentials: { accessKeyId, secretAccessKey },
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
          })
        : null;
  }

  async signedGet(key: string | null | undefined): Promise<{
    url: string;
    expires_in: number;
  } | null> {
    if (!this.client || !this.bucket || !key) return null;
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: SIGNED_TTL_SECONDS },
    );
    return { url, expires_in: SIGNED_TTL_SECONDS };
  }

  async headSize(key: string): Promise<number | null> {
    if (!this.client || !this.bucket) return null;
    try {
      const head = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return head.ContentLength ?? null;
    } catch {
      return null;
    }
  }

  async copyObject(fromKey: string, toKey: string): Promise<boolean> {
    if (!this.client || !this.bucket) return false;
    try {
      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${fromKey}`,
          Key: toKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
