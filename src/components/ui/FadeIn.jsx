"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight scroll-triggered fade-in wrapper.
 * Uses a single IntersectionObserver per mount — no runtime libs.
 * Animations run on `opacity` + `transform` (GPU-composited, zero layout cost).
 */
export default function FadeIn({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  direction = "up", // "up" | "down" | "left" | "right" | "none"
  duration = 600,
  distance = 24,
  once = true,
  threshold = 0.15,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user preference for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const translate = {
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`,
      left: `translateX(${distance}px)`,
      right: `translateX(-${distance}px)`,
      none: "none",
    };

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = translate[direction] || translate.up;
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`;
    el.style.willChange = "opacity, transform";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";

          if (once) observer.unobserve(el);

          // Clean up will-change after animation completes
          setTimeout(() => {
            if (el) el.style.willChange = "auto";
          }, duration + delay + 50);
        } else if (!once) {
          el.style.opacity = "0";
          el.style.transform = translate[direction] || translate.up;
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction, distance, duration, once, threshold]);

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
