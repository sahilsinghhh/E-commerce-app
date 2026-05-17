import crypto from 'crypto';
import { DeleteObjectCommand, DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getPublicImageUrl, uploadConfig } from '../config/storage.js';
import HttpError from '../utils/httpError.js';

const s3 = new S3Client({
  region: uploadConfig.region,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
      : undefined,
});

const imageSignatures = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e470d0a1a0a'],
  'image/webp': ['52494646'],
};

const extensionByMime = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const sanitizeSlug = (value) =>
  String(value || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'product';

export const assertStorageConfigured = () => {
  if (!uploadConfig.bucket) {
    throw new HttpError(500, 'S3 upload bucket is not configured');
  }
};

export const validateImageUploadRequest = ({ fileName, contentType, size, signature }) => {
  if (!fileName || !contentType || !size) {
    throw new HttpError(400, 'fileName, contentType, and size are required');
  }

  if (!uploadConfig.allowedMimeTypes.includes(contentType)) {
    throw new HttpError(400, 'Only JPG, PNG, and WEBP images are allowed');
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!uploadConfig.allowedExtensions.includes(extension)) {
    throw new HttpError(400, 'Invalid image file extension');
  }

  if (Number(size) > uploadConfig.maxFileSize) {
    throw new HttpError(400, 'Image must be 5MB or smaller');
  }

  const normalizedSignature = String(signature || '').toLowerCase();
  const validSignatures = imageSignatures[contentType] || [];
  const hasValidSignature = validSignatures.some((prefix) => normalizedSignature.startsWith(prefix));

  if (!hasValidSignature) {
    throw new HttpError(400, 'Image file signature does not match the declared type');
  }
};

export const createProductImageUploadTarget = async ({
  fileName,
  contentType,
  size,
  signature,
  productSlug,
}) => {
  assertStorageConfigured();
  validateImageUploadRequest({ fileName, contentType, size, signature });

  const extension = extensionByMime[contentType];
  const key = [
    'products',
    sanitizeSlug(productSlug),
    `${Date.now()}-${crypto.randomUUID()}.${extension}`,
  ].join('/');

  const metadata = {
    originalname: encodeURIComponent(fileName.slice(0, 120)),
    optimized: contentType === 'image/webp' ? 'true' : 'false',
  };

  const command = new PutObjectCommand({
    Bucket: uploadConfig.bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: uploadConfig.uploadUrlExpiresIn,
  });

  return {
    key,
    url: getPublicImageUrl(key),
    uploadUrl,
    headers: {
      'Content-Type': contentType,
    },
    expiresIn: uploadConfig.uploadUrlExpiresIn,
  };
};

export const deleteProductImageObject = async (key) => {
  assertStorageConfigured();
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: uploadConfig.bucket,
      Key: key,
    })
  );
};

export const deleteProductImageObjects = async (keys = []) => {
  assertStorageConfigured();
  const safeKeys = keys.filter(Boolean).slice(0, uploadConfig.maxImagesPerProduct);
  if (!safeKeys.length) return;

  await s3.send(
    new DeleteObjectsCommand({
      Bucket: uploadConfig.bucket,
      Delete: {
        Objects: safeKeys.map((Key) => ({ Key })),
        Quiet: true,
      },
    })
  );
};
