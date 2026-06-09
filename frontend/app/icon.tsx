/**
 * app/icon.tsx
 *
 * Next.js App Router ImageResponse favicon.
 * Mirrors the Navbar logo exactly: blue rounded square (#3b82f6) + white
 * ShoppingBag icon. Next automatically serves this as /favicon.ico,
 * icon.png (32×32), and icon.svg depending on the browser's request.
 *
 * Sizes generated:  32×32  (favicon standard)
 */
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: "#3b82f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ShoppingBag path — same icon used in Navbar / AdminSidebar */}
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
