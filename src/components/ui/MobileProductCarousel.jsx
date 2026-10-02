"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";

function getProductHref(id, fallbackHref = "/shop") {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id) ? `/shop/${id}` : fallbackHref;
}

export default function MobileProductCarousel({ products, href = "/shop" }) {
  const totalPages = useMemo(() => Math.ceil(products.length / 2), [products.length]);
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const viewportRef = useRef(null);
  const pauseTimerRef = useRef(null);

  useEffect(() => {
    if (totalPages <= 1 || isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const nextPage = (page + 1) % totalPages;
      viewport.scrollTo({ left: nextPage * viewport.clientWidth, behavior: "smooth" });
      setPage(nextPage);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [isPaused, page, totalPages]);

  const pauseAutoPlay = () => {
    setIsPaused(true);

    if (pauseTimerRef.current) {
      window.clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = window.setTimeout(() => {
      setIsPaused(false);
    }, 6000);
  };

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        window.clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="md:hidden">
      <div
        ref={viewportRef}
        className="overflow-x-auto scroll-smooth touch-auto"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        onTouchStart={pauseAutoPlay}
        onPointerDown={pauseAutoPlay}
        onMouseEnter={pauseAutoPlay}
        onScroll={() => {
          const viewport = viewportRef.current;

          if (!viewport) {
            return;
          }

          const nextPage = Math.round(viewport.scrollLeft / viewport.clientWidth);
          setPage(nextPage);
        }}
      >
        <div className="grid grid-flow-col" style={{ gridAutoColumns: "50%" }}>
          {products.map((product) => (
            <div key={product.id} className="shrink-0 px-1.5" style={{ scrollSnapAlign: "start" }}>
              <ProductCard
                href={getProductHref(product.id, href)}
                name={product.name}
                price={product.price}
                image={product.image}
                wishlistItem={{
                  key: `mobile-${product.id}`,
                  id: product.id,
                  cartItem: null,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {Array.from({ length: totalPages }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${index === page ? "w-5 bg-black dark:bg-white" : "w-1.5 bg-neutral-300"}`}
          />
        ))}
      </div>
    </div>
  );
}