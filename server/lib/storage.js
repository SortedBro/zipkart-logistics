// S3-compatible object storage (Cloudflare R2 / AWS S3). Lazily builds a client only
// when credentials are present; otherwise `isEnabled()` returns false and callers fall
// back to inline base64. Uploads store the file remotely and return a public URL.
const crypto = require('crypto');
const path = require('path');
const config = require('../config');

let client = null;
let PutObjectCommand = null;

if (config.storage.enabled) {
  const { S3Client, PutObjectCommand: PutCmd } = require('@aws-sdk/client-s3');
  PutObjectCommand = PutCmd;
  client = new S3Client({
    region: config.storage.region,
    endpoint: config.storage.endpoint || undefined,
    // Path-style addressing is required for R2 / MinIO-style custom endpoints.
    forcePathStyle: Boolean(config.storage.endpoint),
    credentials: {
      accessKeyId: config.storage.accessKeyId,
      secretAccessKey: config.storage.secretAccessKey,
    },
  });
  console.log(`[storage] object storage enabled (bucket: ${config.storage.bucket})`);
}

function isEnabled() {
  return Boolean(client);
}

function publicUrlFor(key) {
  const { publicUrl, endpoint, bucket, region } = config.storage;
  if (publicUrl) return `${publicUrl}/${key}`;
  if (endpoint) return `${endpoint}/${bucket}/${key}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

// Uploads a Buffer and returns the public URL. `prefix` groups objects (e.g. documents/logos).
async function uploadBuffer(buffer, { contentType, originalName, prefix = 'uploads' } = {}) {
  if (!client) {
    const err = new Error('File storage is not configured.');
    err.status = 503;
    throw err;
  }
  const ext = path.extname(originalName || '').toLowerCase();
  const key = `${prefix}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return publicUrlFor(key);
}

module.exports = { isEnabled, uploadBuffer };
