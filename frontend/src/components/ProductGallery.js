import { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { getProductImages, getPrimaryImage } from '../utils/imageUtils';

export default function ProductGallery({ product }) {
  const images = useMemo(() => {
    const productImages = getProductImages(product);
    return productImages.length
      ? productImages
      : [{ url: getPrimaryImage(product), key: 'fallback', alt: product.name, isPrimary: true }];
  }, [product]);
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, images.findIndex((image) => image.isPrimary)));
  const [fullscreen, setFullscreen] = useState(false);

  const selectedImage = images[selectedIndex] || images[0];

  return (
    <>
      <div className="premium-card overflow-hidden rounded-[2rem]">
        <div className="relative aspect-square overflow-hidden bg-white sm:aspect-[5/4]">
          <img
            src={selectedImage.url}
            alt={selectedImage.alt || product.name}
            className="h-full w-full cursor-zoom-in object-contain p-6 transition duration-500 hover:scale-105"
            onClick={() => setFullscreen(true)}
            loading="eager"
          />
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-ink-900 shadow-sm backdrop-blur hover:bg-white"
          >
            View
          </button>
        </div>

        <div className="border-t border-ink-100 p-3">
          <Swiper modules={[Navigation, Pagination]} slidesPerView={4} spaceBetween={10} navigation>
            {images.map((image, index) => (
              <SwiperSlide key={image.key || image.url}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`block overflow-hidden rounded-2xl border-2 ${
                    selectedIndex === index ? 'border-sky-500' : 'border-transparent'
                  }`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img src={image.url} alt={image.alt || product.name} className="aspect-square w-full object-contain p-2 bg-white" loading="lazy" />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[90] bg-ink-900/95 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-900"
          >
            Close
          </button>
          <Swiper
            modules={[Navigation, Pagination]}
            initialSlide={selectedIndex}
            navigation
            pagination={{ clickable: true }}
            onSlideChange={(swiper) => setSelectedIndex(swiper.activeIndex)}
            className="h-full"
          >
            {images.map((image) => (
              <SwiperSlide key={image.key || image.url}>
                <div className="flex h-full items-center justify-center">
                  <img
                    src={image.url}
                    alt={image.alt || product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </>
  );
}
