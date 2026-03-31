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
