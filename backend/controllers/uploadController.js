import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import HttpError from '../utils/httpError.js';
import { uploadConfig } from '../config/storage.js';
import {
  createProductImageUploadTarget,
  deleteProductImageObject,
  deleteProductImageObjects,
} from '../services/s3UploadService.js';

export const createProductImageUploadUrls = asyncHandler(async (req, res) => {
  const { files = [], productSlug } = req.body;

  if (!Array.isArray(files) || files.length === 0) {
    throw new HttpError(400, 'At least one image is required');
  }

  if (files.length > uploadConfig.maxImagesPerProduct) {
    throw new HttpError(400, `A product can have at most ${uploadConfig.maxImagesPerProduct} images`);
  }

  const uploads = await Promise.all(
    files.map((file) =>
      createProductImageUploadTarget({
        fileName: file.fileName,
        contentType: file.contentType,
        size: file.size,
        signature: file.signature,
        productSlug,
      })
    )
  );

  success(res, { uploads });
});

export const rollbackProductImageUploads = asyncHandler(async (req, res) => {
  const { keys = [] } = req.body;

  if (!Array.isArray(keys)) {
    throw new HttpError(400, 'keys must be an array');
  }

  await deleteProductImageObjects(keys);
  success(res, { deleted: keys.length });
});

export const deleteProductImageUpload = asyncHandler(async (req, res) => {
  const { key } = req.body;
  if (!key) throw new HttpError(400, 'Image key is required');

  await deleteProductImageObject(key);
  success(res, { deleted: true });
});
