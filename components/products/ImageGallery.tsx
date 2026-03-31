"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/types";

interface ImageGalleryProps {
  product: Product;
}


function getGalleryImages(product: Product): string[] {
  const seed = product.id.replace("p-", "");
  return [
    product.image,
    `https://picsum.photos/seed/${seed}a/600/600`,
    `https://picsum.photos/seed/${seed}b/600/600`,
    `https://picsum.photos/seed/${seed}c/600/600`,
  ];
}

export function ImageGallery({ product }: ImageGalleryProps) {
  const images = getGalleryImages(product);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const selectImage = (index: number) => {
    setDirection(index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
  };

  const selectedImage = images[selectedIndex] ?? product.image;

  return (
    <div className="flex flex-col gap-4">
      {/* Main image with crossfade animation */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-cream dark:border-dark-border dark:bg-dark-surface-2">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.img
            key={selectedIndex}
            src={selectedImage}
            alt={`${product.name} — view ${selectedIndex + 1}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>

        {/* Arrow navigation */}
        {images.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { selectImage((selectedIndex - 1 + images.length) % images.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur-sm transition-opacity hover:bg-white dark:bg-dark-surface/90 dark:text-white"
              aria-label="Previous image"
            >
              ‹
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { selectImage((selectedIndex + 1) % images.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur-sm transition-opacity hover:bg-white dark:bg-dark-surface/90 dark:text-white"
              aria-label="Next image"
            >
              ›
            </motion.button>
          </>
        )}

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { selectImage(i); }}
              animate={{ width: i === selectedIndex ? 20 : 8, opacity: i === selectedIndex ? 1 : 0.5 }}
              transition={{ duration: 0.25 }}
              className="h-2 rounded-full bg-white shadow-sm"
              aria-label={`View image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((src, i) => (
          <motion.button
            key={i}
            onClick={() => { selectImage(i); }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${i === selectedIndex
                ? "border-amber"
                : "border-border hover:border-ink-muted dark:border-dark-border"
              }`}
            aria-label={`View image ${i + 1}`}
            aria-pressed={i === selectedIndex}
          >
            <img
              src={src}
              alt={`${product.name} thumbnail ${i + 1}`}
              className="h-full w-full object-cover"
            />
            {/* Active overlay */}
            {i === selectedIndex && (
              <motion.div
                layoutId="thumb-active"
                className="absolute inset-0 bg-amber/10"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
