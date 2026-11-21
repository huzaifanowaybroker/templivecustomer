import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenisInstance = null;

// Use this anywhere you need to scroll programmatically
export const getLenis = () => lenisInstance;

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07,            // lower = smoother, longer glide (default 0.1)
      wheelMultiplier: 0.9,  // slightly less distance per wheel notch
      touchMultiplier: 1.2,  // a little more responsive on touch
      smoothWheel: true,
      syncTouch: false,
    });
    lenisInstance = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return children;
};

export default SmoothScroll;