/**
 * Lazy GSAP loader — client-side only.
 * Usage: const { gsap, ScrollTrigger } = await loadGsap();
 */
export async function loadGsap() {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
