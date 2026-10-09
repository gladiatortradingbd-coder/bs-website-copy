"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import CategorySlider from "@/components/ui/Slider";
import Button from "@/components/ui/Button";
import { DEFAULT_HERO_IMAGE } from "@/data/hero";

const ROTATION_DELAY = 6000;

export default function HeroCarousel({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const imageList = Array.isArray(images) && images.length ? images : [DEFAULT_HERO_IMAGE];

  useEffect(() => {
    if (isPaused || imageList.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % imageList.length);
    }, ROTATION_DELAY);
    return () => window.clearInterval(timer);
  }, [imageList.length, isPaused]);

  const changeImage = (direction) => {
    setActiveIndex((current) => (current + direction + imageList.length) % imageList.length);
  };

  const pauseOnPress = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsPaused(true);
  };

  const resumeOnRelease = (event) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsPaused(false);
  };

  return (
    <section aria-label="Hero" className="flex justify-center px-3 sm:px-5">
      <div className="relative h-[36svh] w-full max-w-7xl overflow-hidden rounded-2xl bg-muted sm:h-[42svh] sm:rounded-3xl md:h-screen">
        <div className="absolute inset-0">
          <a
            href="https://bs-website-copy.vercel.app/shop"
            className="absolute inset-0"
            onPointerDown={pauseOnPress}
            onPointerUp={resumeOnRelease}
            onPointerCancel={resumeOnRelease}
            onPointerLeave={resumeOnRelease}
            aria-label="Shop our collection"
          >
            {imageList.map((image, index) => (
              <Image
                key={`${image}-${index}`}
                src={image}
                alt={`Hero image ${index + 1}`}
                fill
                priority={index === 0}
                className={`object-cover object-bottom transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
              />
            ))}
          </a>

          {imageList.length > 1 ? (
            <>
              <Button
                type="button"
                variant="soft"
                size="icon"
                className="absolute left-3 top-1/2 z-30 h-11 w-11 -translate-y-1/2 border-white/30 bg-black/35 shadow-lg backdrop-blur-md hover:scale-110 hover:bg-black/55 sm:left-5 sm:h-12 sm:w-12"
                onClick={() => changeImage(-1)}
                aria-label="Previous hero image"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <Button
                type="button"
                variant="soft"
                size="icon"
                className="absolute right-3 top-1/2 z-30 h-11 w-11 -translate-y-1/2 border-white/30 bg-black/35 shadow-lg backdrop-blur-md hover:scale-110 hover:bg-black/55 sm:right-5 sm:h-12 sm:w-12"
                onClick={() => changeImage(1)}
                aria-label="Next hero image"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <div className="absolute bottom-14 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 backdrop-blur-md sm:bottom-16">
                {imageList.map((image, index) => (
                  <button key={`${image}-dot-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} aria-label={`Show hero image ${index + 1}`} aria-selected={index === activeIndex} role="tab" />
                ))}
              </div>
            </>
          ) : null}
          <div className="absolute bottom-0 left-0 z-20 w-full"><CategorySlider /></div>
        </div>
      </div>
    </section>
  );
}
