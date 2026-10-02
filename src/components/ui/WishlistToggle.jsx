"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistToggle({ item, className = "", iconClassName = "", ariaLabel }) {
  const { hasItem, toggleItem } = useWishlist();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isActive = hasItem(item?.key ?? item?.id ?? item?.href ?? item?.name ?? item?.title ?? "");
  const displayActive = isHydrated ? isActive : false;

  const handleClick = () => {
    toggleItem(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={displayActive}
      aria-label={ariaLabel || `${displayActive ? "Remove" : "Add"} ${item?.name ?? item?.title ?? "product"} ${displayActive ? "from" : "to"} wishlist`}
      className={`inline-flex items-center justify-center transition-all duration-300 ${className}`}
    >
      <Heart
        className={`transition-all duration-300 ${displayActive ? "fill-current text-rose-500" : "text-white dark:text-black"} ${iconClassName}`}
      />
    </button>
  );
}
