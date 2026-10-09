"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Heart, ShoppingCart, Star, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import WishlistToggle from "@/components/ui/WishlistToggle";

function formatPrice(price) {
  if (typeof price === "number") {
    return `Tk ${price}`;
  }

  if (typeof price === "string" && price.trim()) {
    return price.startsWith("Tk ") ? price : price.replace(/^\$/, "Tk ");
  }

  return "";
}

function StarRow({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1 text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4.5 w-4.5 ${index < Math.round(rating) ? "fill-current" : "text-neutral-300"}`}
        />
      ))}
    </div>
  );
}

export default function QuickViewModal({ open, onClose, product, wishlistItem, href = "/shop" }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const [activeImage, setActiveImage] = useState(product?.image ?? "");
  const photos = Array.isArray(product?.photos) ? product.photos.filter(Boolean) : [];
  if (product?.image && !photos.includes(product.image)) {
    photos.unshift(product.image);
  }

  const displayPrice = formatPrice(product?.price);
  const ratingAverage = Number(product?.ratingAverage) || 0;
  const reviewCount = Number(product?.reviewCount) || 0;
  const stockCount = product?.stock ?? null;
  const isAvailable = stockCount === null ? true : stockCount > 0;
  const stockLabel = stockCount === null ? "In stock" : stockCount > 0 ? `${stockCount} left` : "Out of stock";
  const hasColors = Array.isArray(product?.colors) && product.colors.length > 0;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const selectedImage = activeImage || product?.image || photos[0] || "";

  const handleAdd = () => {
    if (!isAvailable) {
      showToast({
        title: "Out of stock",
        description: `${product?.title ?? "This product"} is currently unavailable.`,
        variant: "warning",
      });
      return;
    }

    const wasAdded = addItem(
      {
        id: product?.id ?? product?.key,
        key: product?.key ?? product?.id,
        title: product?.title ?? "",
        price: product?.price,
        image: selectedImage,
        photos: photos.length > 0 ? photos : product?.image ? [product.image] : [],
        selectedColor: product?.selectedColor ?? null,
        stock: product?.stock ?? null,
      },
      1,
    );

    if (!wasAdded) {
      showToast({
        title: "Out of stock",
        description: `${product?.title ?? "This product"} is currently unavailable.`,
        variant: "warning",
      });
      return;
    }

    openCart();
    onClose();
  };

  const handleBuyNow = () => {
    if (!isAvailable) {
      showToast({
        title: "Out of stock",
        description: `${product?.title ?? "This product"} is currently unavailable.`,
        variant: "warning",
      });
      return;
    }

    handleAdd();
    router.push("/checkout");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 dark:bg-white/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-4xl border border-white/20 dark:border-black/20 bg-background shadow-[0_30px_120px_rgba(0,0,0,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Quick view</p>
            <p className="mt-1 text-sm text-muted-foreground">Preview details without leaving the page</p>
          </div>

          <button
            type="button"
            aria-label="Close quick view"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-color bg-background text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[88vh] overflow-y-auto lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-muted p-4 sm:p-6">
            <div className="relative overflow-hidden rounded-3xl bg-background shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
              <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                {product?.category ? (
                  <span className="rounded-full bg-black dark:bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:text-black">
                    {product.category}
                  </span>
                ) : null}

                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${stockCount === 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {stockLabel}
                </span>
              </div>

              <div className="relative aspect-4/5 w-full">
                {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={product?.title || "Product preview"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-sm text-neutral-400">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {photos.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {photos.slice(0, 5).map((photo) => (
                  <button
                    key={photo}
                    type="button"
                    onClick={() => setActiveImage(photo)}
                    className={`relative overflow-hidden rounded-2xl border transition-all ${photo === selectedImage ? "border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10" : "border-border-color hover:border-neutral-400"}`}
                    aria-label={`Show preview image for ${product?.title ?? "product"}`}
                  >
                    <div className="relative aspect-square">
                      <Image src={photo} alt="Product thumbnail" fill sizes="120px" className="object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {product?.category || "Saree"}
                </span>
                {reviewCount > 0 ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                    <StarRow rating={ratingAverage} />
                    <span>{reviewCount} review{reviewCount === 1 ? "" : "s"}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 id="quick-view-title" className="text-2xl font-semibold leading-tight text-neutral-950 sm:text-3xl">
                    {product?.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {product?.description || "A cleaner preview of the product so shoppers can decide faster."}
                  </p>
                </div>

                <WishlistToggle
                  item={wishlistItem ?? {
                    key: product?.key ?? product?.id ?? product?.title,
                    id: product?.id ?? null,
                    name: product?.title ?? "",
                    title: product?.title ?? "",
                    price: product?.price,
                    image: selectedImage,
                    href,
                    cartItem: {
                      id: product?.id,
                      key: product?.key ?? product?.id,
                      title: product?.title,
                      price: product?.price,
                      image: activeImage || product?.image,
                      photos,
                      selectedColor: product?.selectedColor ?? null,
                      stock: product?.stock ?? null,
                    },
                  }}
                  ariaLabel={`Toggle ${product?.title ?? "product"} in wishlist`}
                  className="h-11 w-11 shrink-0 rounded-full border border-border-color bg-background text-foreground transition-all hover:border-black dark:hover:border-white hover:text-rose-500"
                  iconClassName="h-5.5 w-5.5"
                />
              </div>

              {displayPrice ? (
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-semibold tracking-tight text-neutral-950">{displayPrice}</p>
                  <p className="pb-1 text-xs uppercase tracking-[0.18em] text-neutral-400">per saree</p>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[22px] border border-border-color bg-muted p-4 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Stock</p>
                <p className="mt-1 font-medium text-foreground">{stockLabel}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Color options</p>
                <p className="mt-1 font-medium text-foreground">{hasColors ? `${product.colors.length} available` : "Single tone"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Rating</p>
                <p className="mt-1 font-medium text-foreground">{reviewCount > 0 ? ratingAverage.toFixed(1) : "New"}</p>
              </div>
            </div>

            {Array.isArray(product?.colors) && product.colors.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Popular colors</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.slice(0, 5).map((color) => (
                    <span
                      key={color}
                      className="rounded-full border border-border-color bg-background px-3 py-1.5 text-sm text-foreground"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={handleAdd} className="h-12 justify-center rounded-2xl">
                <ShoppingCart className="h-4.5 w-4.5" />
                {isAvailable ? "Add to cart" : "Out of stock"}
              </Button>

              <Button type="button" variant="primary" onClick={handleBuyNow} className="h-12 justify-center rounded-2xl">
                {isAvailable ? "Buy now" : "Out of stock"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-border-color bg-background px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Want the full product page? Open the complete details and reviews.
              </p>

              <Link
                href={href}
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-border-color px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:bg-muted"
              >
                View full details
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
