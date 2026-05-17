import { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { getProductImages, getPrimaryImage } from '../utils/imageUtils';

export default function ProductCardMedia({ product }) {
  const images = useMemo(() => getProductImages(product), [product]);
  const primaryImage = getPrimaryImage(product);
  const previewImages = images.length ? images : [{ url: primaryImage, alt: product.name, key: primaryImage }];

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-white">
      <img
        src={primaryImage}
        alt={product.name}
        loading="lazy"
        className="hidden h-full w-full object-contain p-4 transition duration-700 group-hover:scale-105 sm:block"
      />
      {previewImages[1] && (
        <img
          src={previewImages[1].url}
          alt={previewImages[1].alt || product.name}
          loading="lazy"
          className="absolute inset-0 hidden h-full w-full object-contain p-4 opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100 sm:block"
        />
      )}

      <div className="h-full sm:hidden">
        <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="h-full">
          {previewImages.map((image) => (
            <SwiperSlide key={image.key || image.url}>
              <img
                src={image.url}
                alt={image.alt || product.name}
                loading="lazy"
                className="h-full w-full object-contain p-4"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
