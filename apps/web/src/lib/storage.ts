import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerEnv } from "@formatura/config/env";

let cachedEnv: ReturnType<typeof getServerEnv> | null = null;
let cachedClient: S3Client | null = null;

function loadEnv() {
  if (!cachedEnv) {
    cachedEnv = getServerEnv();
  }
  return cachedEnv;
}

function getS3Client() {
  if (!cachedClient) {
    const env = loadEnv();
    const endpoint =
      env.S3_PRESIGN_ENDPOINT || env.S3_PUBLIC_ENDPOINT || env.S3_ENDPOINT;
    cachedClient = new S3Client({
      endpoint,
      region: env.S3_REGION,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY
      }
    });
  }
  return cachedClient;
}

export async function createPresignedPutUrl(params: {
  objectKey: string;
  contentType?: string;
}) {
  const env = loadEnv();
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: params.objectKey,
    ContentType: params.contentType || "application/octet-stream"
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: 900 });
}

export function publicObjectUrl(objectKey: string) {
  const env = loadEnv();
  const base = (env.S3_PUBLIC_ENDPOINT || env.S3_ENDPOINT).replace(/\/$/, "");
  return `${base}/${env.S3_BUCKET}/${objectKey}`;
}

