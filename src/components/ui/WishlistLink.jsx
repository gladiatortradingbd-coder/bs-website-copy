"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistLink({ className = "", label = "Wishlist", showLabel = false }) {
  const { count } = useWishlist();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const displayCount = isHydrated ? count : 0;

  return (
    <Link
      href="/wishlist"
      className={`relative inline-flex items-center justify-center gap-2 p-2 text-foreground transition-all duration-300 hover:text-[#065f46] ${className}`}
      aria-label={`${label}${displayCount > 0 ? `, ${displayCount} saved items` : ""}`}
    >
      <span className="relative inline-flex items-center justify-center">
        <Heart className="h-6 w-6 transition-transform duration-300 hover:scale-110" />
        {displayCount > 0 ? (
          <span className="absolute -right-2 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border border-white dark:border-black bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white dark:text-black shadow-sm">
            {displayCount}
          </span>
        ) : null}
      </span>

      {showLabel ? <span className="text-sm font-medium">{label}</span> : null}
    </Link>
  );
}
