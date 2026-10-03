"use client";

import Image from "next/image";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import PlantSlider from "@/components/ui/Slider";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
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

  return (
    <section aria-label="Hero" className="flex justify-center px-3 sm:px-5">
      <div className="relative h-[36svh] w-full max-w-7xl overflow-hidden rounded-2xl bg-muted sm:h-[42svh] sm:rounded-3xl md:h-screen">
        <div className="relative z-10 flex flex-col items-center gap-2 pb-4 pt-4 sm:gap-3 sm:pb-6 sm:pt-10 md:gap-5 md:pb-10 md:pt-20">
          <FadeIn delay={100} direction="up">
            <h1 className="text-center text-3xl font-bold leading-tight text-white sm:text-5xl md:text-7xl">Eco-friendly plants</h1>
          </FadeIn>
          <FadeIn delay={250} direction="up">
            <p className="max-w-[280px] text-center text-xs leading-normal text-white sm:max-w-lg sm:text-sm md:max-w-2xl md:text-lg">
              Handpicked indoor plants, rare tropicals, and curated pots — delivered fresh to your door across Bangladesh.
            </p>
          </FadeIn>
          <FadeIn delay={400} direction="up">
            <Button href="/shop" variant="primary" size="sm" className="btn-shimmer sm:h-12 sm:px-5 sm:text-sm md:h-14 md:px-8">Shop now</Button>
          </FadeIn>
        </div>

        <div className="absolute inset-0">
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

          {imageList.length > 1 ? (
            <div className="absolute bottom-14 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur-sm sm:bottom-16">
              <Button type="button" variant="soft" size="icon" className="h-8 w-8" onClick={() => changeImage(-1)} aria-label="Previous hero image"><ChevronLeft className="h-4 w-4" /></Button>
              <Button type="button" variant="soft" size="icon" className="h-8 w-8" onClick={() => setIsPaused((current) => !current)} aria-label={isPaused ? "Resume hero rotation" : "Pause hero rotation"}>{isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>
              <Button type="button" variant="soft" size="icon" className="h-8 w-8" onClick={() => changeImage(1)} aria-label="Next hero image"><ChevronRight className="h-4 w-4" /></Button>
              <div className="ml-1 flex items-center gap-1.5" role="tablist" aria-label="Hero images">
                {imageList.map((image, index) => (
                  <button key={`${image}-dot-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} aria-label={`Show hero image ${index + 1}`} aria-selected={index === activeIndex} role="tab" />
                ))}
              </div>
            </div>
          ) : null}
          <div className="absolute bottom-0 left-0 z-20 w-full"><PlantSlider /></div>
        </div>
      </div>
    </section>
  );
}
