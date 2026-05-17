export const uploadConfig = {
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,
  cloudFrontUrl: process.env.CLOUDFRONT_URL,
  maxImagesPerProduct: 5,
  maxFileSize: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  uploadUrlExpiresIn: 60 * 5,
};

export const getPublicImageUrl = (key) => {
  if (uploadConfig.cloudFrontUrl) {
    return `${uploadConfig.cloudFrontUrl.replace(/\/$/, '')}/${key}`;
  }

  return `https://${uploadConfig.bucket}.s3.${uploadConfig.region}.amazonaws.com/${key}`;
};
