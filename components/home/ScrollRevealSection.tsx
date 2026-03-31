"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollRevealSection — wraps a section and activates
 * IntersectionObserver to trigger `.reveal → .revealed` on children.
 * Works with `.reveal-delay-{n}` utility classes for staggering.
 */
export function ScrollRevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reveal all .reveal children in this section
            section.querySelectorAll(".reveal").forEach((el) => {
              el.classList.add("revealed");
            });
            // Disconnect — each element only needs to reveal once
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return <section ref={ref}>{children}</section>;
}
