/**
 * Image carousel for the public homepage gallery section.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface GallerySlide {
  title: string;
  image: string;
  alt: string;
}

interface GalleryCarouselProps {
  slides: GallerySlide[];
}

export function GalleryCarousel({ slides }: GalleryCarouselProps) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const visible = slides.slice(index, index + 4);
  const padded =
    visible.length < 4
      ? [...visible, ...slides.slice(0, 4 - visible.length)]
      : visible;

  const go = (direction: -1 | 1) => {
    setIndex((prev) => (prev + direction + slides.length) % slides.length);
  };

  return (
    <div className="gallery-carousel">
      <div className="gallery-carousel__track">
        <AnimatePresence mode="popLayout">
          {padded.map((slide, i) => (
            <motion.figure
              key={`${slide.title}-${index}-${i}`}
              className="gallery-carousel__slide"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <div className="gallery-carousel__image-wrap">
                <img src={slide.image} alt={slide.alt} loading="lazy" />
              </div>
              <figcaption>{slide.title}</figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      <div className="gallery-carousel__controls">
        <button type="button" className="gallery-carousel__arrow" onClick={() => go(-1)} aria-label="Previous">
          ←
        </button>
        <div className="gallery-carousel__dots">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              className={`gallery-carousel__dot${i === index ? ' gallery-carousel__dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to ${slide.title}`}
            />
          ))}
        </div>
        <button type="button" className="gallery-carousel__arrow" onClick={() => go(1)} aria-label="Next">
          →
        </button>
      </div>
    </div>
  );
}
