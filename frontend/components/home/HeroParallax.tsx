"use client";

import { useLayoutEffect, useRef } from "react";

export function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap, ScrollTrigger } = await import("gsap").then(async (g) => {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        g.default.registerPlugin(ScrollTrigger);
        return { gsap: g.default, ScrollTrigger };
      });

      const el = ref.current;
      if (!el) return;

      const tween = gsap.to(el, {
        y: "30%",
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") ?? el,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        ScrollTrigger.refresh();
      };
    })();

    return () => cleanup?.();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Background gradient parallax layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber/5 dark:from-primary/10 dark:to-amber/10" />
    </div>
  );
}
