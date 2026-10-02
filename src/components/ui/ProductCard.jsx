"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, ShoppingCart } from "lucide-react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import WishlistToggle from "@/components/ui/WishlistToggle";
import QuickViewModal from "@/components/ui/QuickViewModal";

export default function ProductCard({ href = "/shop", name, price, image, alt, wishlistItem, product }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const stockCount = product?.stock ?? null;
  const isAvailable = stockCount === null ? true : stockCount > 0;
  const displayPrice =
    typeof price === "number"
      ? `Tk ${price}`
      : typeof price === "string"
        ? price.startsWith("Tk ")
          ? price
          : price.replace(/^\$/, "Tk ")
        : "";

  return (
    <>
      <article className="group my-2 overflow-hidden border border-border-color bg-background shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-black dark:hover:border-white hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)] md:my-0">
      <div className="relative overflow-hidden bg-muted">
        <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
          <Link href={href} aria-label={name} className="block">
            <Image
              src={optimizeCloudinaryUrl(image)}
              alt={alt || name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          <span className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isAvailable ? "bg-emerald-100 text-emerald-700 animate-soft-pulse" : "bg-rose-100 text-rose-700"}`}>
            {isAvailable ? "In stock" : "Out of stock"}
          </span>

          <WishlistToggle
            item={{
              key: wishlistItem?.key ?? name,
              id: wishlistItem?.id ?? null,
              name,
              price,
              image,
              href,
              cartItem: wishlistItem?.cartItem ?? null,
            }}
            ariaLabel={`Toggle ${name} in wishlist`}
            className="absolute right-3 top-3 z-10 h-11 w-11 rounded-full border-0 bg-transparent text-white dark:text-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:scale-110 hover:text-rose-500"
            iconClassName="h-5.5 w-5.5"
          />

          <button
            type="button"
            aria-label={`Quick view ${name}`}
            onClick={() => setIsQuickViewOpen(true)}
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 overflow-hidden bg-black/60 dark:bg-white/60 px-4 py-0 text-white dark:text-black opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:py-4 group-hover:opacity-100"
          >
            <Eye className="h-4.5 w-4.5" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Quick view</span>
          </button>
        </div>

      </div>

      <div className="px-3 pb-4 pt-3">
        <Link href={href} className="block">
          <h3 className="px-1 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-muted-foreground md:px-0 md:text-[17px]">
            {name}
          </h3>
        </Link>

        {displayPrice ? (
          <p className="mt-2 px-1 text-sm font-medium text-foreground md:px-0 md:text-base">
            {displayPrice}
          </p>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 rounded-xl px-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
            onClick={() => {
              if (!isAvailable) {
                showToast({
                  title: "Out of stock",
                  description: `${name} is currently unavailable.`,
                  variant: "warning",
                });
                return;
              }

              const wasAdded = addItem({
                id: product?.id ?? wishlistItem?.id ?? name,
                key: product?.key ?? wishlistItem?.key ?? name,
                title: product?.title ?? name,
                price,
                image,
                photos: product?.photos ?? (image ? [image] : []),
                selectedColor: product?.selectedColor ?? null,
                stock: product?.stock ?? null,
              }, 1);

              if (!wasAdded) {
                showToast({
                  title: "Out of stock",
                  description: `${name} is currently unavailable.`,
                  variant: "warning",
                });
                return;
              }

              openCart();
            }}
            title={isAvailable ? "Add this product to your cart" : "This product is out of stock"}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAvailable ? "Add to cart" : "Out of stock"}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            className="h-10 rounded-xl px-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
            onClick={() => {
              if (!isAvailable) {
                showToast({
                  title: "Out of stock",
                  description: `${name} is currently unavailable.`,
                  variant: "warning",
                });
                return;
              }

              const wasAdded = addItem({
                id: product?.id ?? wishlistItem?.id ?? name,
                key: product?.key ?? wishlistItem?.key ?? name,
                title: product?.title ?? name,
                price,
                image,
                photos: product?.photos ?? (image ? [image] : []),
                selectedColor: product?.selectedColor ?? null,
                stock: product?.stock ?? null,
              }, 1);

              if (!wasAdded) {
                showToast({
                  title: "Out of stock",
                  description: `${name} is currently unavailable.`,
                  variant: "warning",
                });
                return;
              }

              openCart();
              router.push("/checkout");
            }}
            title={isAvailable ? "Buy this product now" : "This product is out of stock"}
          >
            {isAvailable ? "Buy now" : "Out of stock"}
          </Button>
        </div>
      </div>
    </article>
      <QuickViewModal
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={{
          id: product?.id ?? wishlistItem?.id ?? name,
          key: product?.key ?? wishlistItem?.key ?? name,
          title: product?.title ?? name,
          price,
          image,
          photos: product?.photos ?? (image ? [image] : []),
          category: product?.category ?? wishlistItem?.category ?? null,
          description: product?.description ?? null,
          selectedColor: product?.selectedColor ?? null,
          colors: product?.colors ?? [],
          stock: product?.stock ?? null,
          ratingAverage: product?.ratingAverage ?? null,
          reviewCount: product?.reviewCount ?? null,
        }}
        wishlistItem={{
          key: wishlistItem?.key ?? product?.id ?? name,
          id: wishlistItem?.id ?? product?.id ?? null,
          name: product?.title ?? name,
          title: product?.title ?? name,
          price,
          image,
          href,
          cartItem: wishlistItem?.cartItem ?? null,
        }}
        href={href}
      />
    </>
  );
}