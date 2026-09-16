import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env';

let client: S3Client | null = null;

export function isObjectStorageConfigured(): boolean {
  return Boolean(
    env.s3.endpoint &&
      env.s3.bucket &&
      env.s3.accessKeyId &&
      env.s3.secretAccessKey &&
      env.s3.publicBaseUrl
  );
}

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: env.s3.region,
      endpoint: env.s3.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.s3.accessKeyId,
        secretAccessKey: env.s3.secretAccessKey,
      },
    });
  }
  return client;
}

export async function putUpload(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (!isObjectStorageConfigured()) {
    throw new Error('Object storage is not configured');
  }
  await getClient().send(
    new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  const base = env.s3.publicBaseUrl.replace(/\/$/, '');
  return `${base}/${key}`;
}
