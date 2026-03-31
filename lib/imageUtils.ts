/**
 * imageUtils.ts — next/image helpers
 *
 * BLUR PLACEHOLDER:
 *   next/image can show a blurred preview while the real image loads.
 *   For LOCAL images: Next.js generates the blur automatically at build time.
 *   For REMOTE images (picsum.photos): we must supply blurDataURL manually.
 *
 *   A blurDataURL is a tiny base64-encoded image (typically 4×4 or 8×8 pixels).
 *   Next.js scales it up and applies a CSS blur filter for a smooth loading UX.
 *
 *   SHIMMER_BLUR: a 1×1 pixel SVG encoded as base64.
 *   We use a warm parchment tone (#ede8e0) to match the app's design language.
 *   This is injected as placeholder="blur" blurDataURL={SHIMMER_BLUR}.
 *
 * PRIORITY:
 *   priority={true} on next/image tells Next.js to preload the image via
 *   <link rel="preload"> in the HTML head. Use for above-the-fold images only
 *   (hero images, first visible product). LCP (Largest Contentful Paint) improves.
 *
 *   Setting priority on ALL images is wrong — it defeats lazy loading and
 *   hurts performance by downloading off-screen images immediately.
 *
 * SIZES:
 *   The sizes prop is a media-query string telling the browser how wide the
 *   image will be at each breakpoint. Next.js uses this to generate a srcset
 *   and serve the smallest adequate image. Without sizes, Next.js defaults to
 *   100vw — downloading a 1200px image for a 300px card.
 */

// Tiny warm-toned base64 placeholder (matches --parchment colour)
export const SHIMMER_BLUR =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1">
      <rect width="1" height="1" fill="#ede8e0"/>
    </svg>`,
  ).toString("base64");

// Standard sizes for the product grid cards
export const CARD_IMAGE_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

// Sizes for the product detail hero (half-width on desktop)
export const DETAIL_IMAGE_SIZES =
  "(max-width: 1024px) 100vw, 50vw";
