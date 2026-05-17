import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  createProductImageUploadUrls,
  rollbackProductImageUploads,
  uploadImageToS3,
} from '../api/uploadApi';
import { optimizeImage, readFileSignature, validateBrowserImage } from '../utils/imageUtils';
import { useToast } from '../context/ToastContext';

const maxImages = 5;

const normalizePrimary = (items) => {
  if (!items.length) return [];
  const primaryIndex = items.findIndex((image) => image.isPrimary);
  const selectedIndex = primaryIndex >= 0 ? primaryIndex : 0;
  return items.map((image, index) => ({ ...image, isPrimary: index === selectedIndex }));
};

export default function ProductImageUploader({ images, onChange, productName }) {
  const { showToast } = useToast();
  const [uploads, setUploads] = useState([]);

  const availableSlots = maxImages - images.length - uploads.length;

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const nextFiles = acceptedFiles.slice(0, Math.max(0, availableSlots));
      if (!nextFiles.length) return;

      const prepared = [];
      const uploadedKeys = [];

      try {
        for (const file of nextFiles) {
          await validateBrowserImage(file);
          const optimizedFile = await optimizeImage(file);
          const signature = await readFileSignature(optimizedFile);
          const id = `${file.name}-${Date.now()}-${Math.random()}`;
          prepared.push({
            id,
            file: optimizedFile,
            previewUrl: URL.createObjectURL(optimizedFile),
            progress: 0,
            status: 'ready',
          });
        }

        setUploads((items) => [...items, ...prepared]);

        const presignResponse = await createProductImageUploadUrls({
          productSlug: productName,
          files: await Promise.all(
            prepared.map(async (item) => ({
              fileName: item.file.name,
              contentType: item.file.type,
              size: item.file.size,
              signature: await readFileSignature(item.file),
            }))
          ),
        });

        const uploadedImages = [];

        for (const [index, target] of presignResponse.data.uploads.entries()) {
          const upload = prepared[index];
          setUploads((items) =>
            items.map((item) => (item.id === upload.id ? { ...item, status: 'uploading' } : item))
          );

          await uploadImageToS3({
            uploadUrl: target.uploadUrl,
            file: upload.file,
            headers: target.headers,
            onProgress: (progress) => {
              setUploads((items) =>
                items.map((item) => (item.id === upload.id ? { ...item, progress } : item))
              );
            },
          });

          uploadedKeys.push(target.key);
          uploadedImages.push({
            url: target.url,
            key: target.key,
            alt: `${productName || 'Product'} image ${images.length + index + 1}`,
            isPrimary: images.length === 0 && index === 0,
          });
        }

        const nextImages = normalizePrimary([...images, ...uploadedImages].slice(0, maxImages));
        onChange(nextImages);
        setUploads((items) => items.filter((item) => !prepared.some((upload) => upload.id === item.id)));
        showToast({ title: 'Images uploaded', message: `${uploadedImages.length} product image(s) added.` });
      } catch (error) {
        if (uploadedKeys.length) await rollbackProductImageUploads(uploadedKeys);
        setUploads((items) => items.filter((item) => !prepared.some((upload) => upload.id === item.id)));
        showToast({
          title: 'Image upload failed',
          message: error.response?.data?.message || error.message || 'Please try again.',
          type: 'error',
        });
      }
    },
    [availableSlots, images, onChange, productName, showToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: availableSlots,
    maxSize: 5 * 1024 * 1024,
    disabled: availableSlots <= 0,
  });

  const setPrimary = (key) => {
    onChange(images.map((image) => ({ ...image, isPrimary: image.key === key })));
  };

  const removeImage = (key) => {
    const remaining = images.filter((image) => image.key !== key);
    onChange(normalizePrimary(remaining));
  };

  const moveImage = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= images.length) return;
    const nextImages = [...images];
    const [item] = nextImages.splice(fromIndex, 1);
    nextImages.splice(toIndex, 0, item);
    onChange(nextImages);
  };

  const helperText = useMemo(() => {
    if (availableSlots <= 0) return 'Maximum 5 images reached.';
    return `Drop up to ${availableSlots} more image${availableSlots === 1 ? '' : 's'}. JPG, PNG, WEBP. Max 5MB each.`;
  }, [availableSlots]);

  return (
    <div className="grid gap-4">
      <div
        {...getRootProps()}
        className={`rounded-[1.5rem] border border-dashed p-6 text-center transition ${
          isDragActive ? 'border-sky-400 bg-sky-50' : 'border-ink-200 bg-white/70'
        } ${availableSlots <= 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-sky-300 hover:bg-sky-50/60'}`}
        role="button"
        aria-label="Upload product images"
      >
        <input {...getInputProps()} />
        <p className="font-display text-xl font-extrabold text-ink-900">Drag product images here</p>
        <p className="mt-2 text-sm font-semibold text-ink-500">{helperText}</p>
        <p className="mt-2 text-xs font-semibold text-ink-400">Images are optimized to WebP before upload.</p>
      </div>

      {(images.length > 0 || uploads.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <article key={image.key} className="rounded-3xl border border-ink-100 bg-white/80 p-3">
              <img src={image.url} alt={image.alt} className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <input
                className="input-field mt-3"
                value={image.alt}
                onChange={(event) =>
                  onChange(images.map((item) => (item.key === image.key ? { ...item, alt: event.target.value } : item)))
                }
                placeholder="SEO image alt text"
                aria-label="Image alt text"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setPrimary(image.key)} className={image.isPrimary ? 'btn-primary px-3 py-2' : 'btn-secondary px-3 py-2'}>
                  {image.isPrimary ? 'Primary' : 'Make primary'}
                </button>
                <button type="button" onClick={() => moveImage(index, -1)} className="btn-secondary px-3 py-2" disabled={index === 0}>
                  Up
                </button>
                <button type="button" onClick={() => moveImage(index, 1)} className="btn-secondary px-3 py-2" disabled={index === images.length - 1}>
                  Down
                </button>
                <button type="button" onClick={() => removeImage(image.key)} className="rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100">
                  Remove
                </button>
              </div>
            </article>
          ))}

          {uploads.map((upload) => (
            <article key={upload.id} className="rounded-3xl border border-ink-100 bg-white/80 p-3">
              <img src={upload.previewUrl} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${upload.progress}%` }} />
              </div>
              <p className="mt-2 text-sm font-bold text-ink-500">{upload.status} · {upload.progress}%</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
