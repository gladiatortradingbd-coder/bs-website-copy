"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LoaderCircle, Minus, Plus, Send, Share2, ShoppingCart, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";

function formatDate(value) {
  if (!value) return "Recently";

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "Recently";
  }
}

function StarRow({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`h-4.5 w-4.5 ${index < Math.round(rating) ? "fill-current" : "text-neutral-300"}`} />
      ))}
    </div>
  );
}

export default function ProductDetailClient({ product, initialReviews = [], similarProducts = [], recommendedProducts = [] }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const { hasItem, toggleItem } = useWishlist();
  const [isMounted, setIsMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");
  const [activeImage, setActiveImage] = useState(product.photos?.[0] ?? "");
  const [reviews, setReviews] = useState(initialReviews);
  const [summary, setSummary] = useState({
    count: Number(product.reviewCount) || initialReviews.length || 0,
    average: Number(product.ratingAverage) || 0,
  });
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewPreviews, setReviewPreviews] = useState([]);
  const [reviewMessage, setReviewMessage] = useState("");
  const [sharingMessage, setSharingMessage] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const fileInputRef = useRef(null);

  const hasColorChoices = (product.colors ?? []).length > 0;
  const stockCount = product.stock ?? null;
  const isAvailable = stockCount === null ? true : stockCount > 0;
  const isWishlisted = isMounted && hasItem(product.id);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (stockCount !== null) {
      setQuantity((current) => Math.min(Math.max(current, 1), Math.max(stockCount, 1)));
    }
  }, [stockCount]);

  useEffect(() => {
    if (!activeImage && product.photos?.length > 0) {
      setActiveImage(product.photos[0]);
    }
  }, [activeImage, product.photos]);

  useEffect(() => {
    return () => {
      reviewPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [reviewPreviews]);

  const ratingText = useMemo(() => {
    const count = Number(summary.count) || 0;
    const average = Number(summary.average) || 0;

    if (count === 0) {
      return "No reviews yet";
    }

    return `${average.toFixed(1)} / 5 from ${count} review${count === 1 ? "" : "s"}`;
  }, [summary]);

  const baseCartItem = {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.photos?.[0] ?? "",
    photos: product.photos,
    selectedColor: selectedColor || null,
  };

  const handleQuantityChange = (nextQuantity) => {
    const maxQuantity = stockCount === null ? 99 : Math.max(stockCount, 1);
    setQuantity(Math.min(Math.max(nextQuantity, 1), maxQuantity));
  };

  const handleAddToCart = (shouldBuyNow = false) => {
    if (!isAvailable) {
      setReviewMessage("This product is out of stock.");
      showToast({
        title: "Out of stock",
        description: `${product.title} is currently unavailable.`,
        variant: "warning",
      });
      return;
    }

    if (hasColorChoices && !selectedColor) {
      setReviewMessage("Please select a color first.");
      return;
    }

    const wasAdded = addItem({
      ...baseCartItem,
      key: `${product.id}|${selectedColor || "default"}`,
    }, quantity);

    if (!wasAdded) {
      setReviewMessage("This product is out of stock.");
      showToast({
        title: "Out of stock",
        description: `${product.title} is currently unavailable.`,
        variant: "warning",
      });
      return;
    }

    if (!shouldBuyNow) {
      openCart();
    }

    if (shouldBuyNow) {
      router.push("/checkout");
    }
  };

  const handleWishlistToggle = () => {
    toggleItem({
      key: product.id,
      id: product.id,
      name: product.title,
      title: product.title,
      price: product.price,
      image: product.photos?.[0] ?? "",
      href: `/shop/${product.id}`,
      cartItem: baseCartItem,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
        setSharingMessage("Link shared.");
        return;
      }

      await navigator.clipboard.writeText(url);
      setSharingMessage("Product link copied.");
    } catch {
      setSharingMessage("Could not share this product right now.");
    }
  };

  const handleReviewImagesChange = (event) => {
    const files = Array.from(event.target.files ?? []);

    reviewPreviews.forEach((preview) => URL.revokeObjectURL(preview));

    if (!files.length) {
      setReviewImages([]);
      setReviewPreviews([]);
      return;
    }

    const nextPreviews = [];

    try {
      const nextImages = files.slice(0, 4);

      for (const file of nextImages) {
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select image files only.");
        }

        nextPreviews.push(URL.createObjectURL(file));
      }

      setReviewImages(nextImages);
      setReviewPreviews(nextPreviews);
      setReviewMessage("");
    } catch (error) {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setReviewImages([]);
      setReviewPreviews([]);
      setReviewMessage(error instanceof Error ? error.message : "Could not load review images.");
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewMessage("");
    setSavingReview(true);

    try {
      const payload = new FormData();
      payload.append("name", reviewName.trim());
      payload.append("rating", String(reviewRating));
      payload.append("comment", reviewComment.trim());

      for (const image of reviewImages) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Could not read a review image."));
          reader.readAsDataURL(image);
        });

        payload.append("images", String(dataUrl));
      }

      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit review.");
      }

      if (data.review) {
        setReviews((current) => [data.review, ...current]);
      }

      if (data.summary) {
        setSummary(data.summary);
      }

      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      setReviewImages([]);
      reviewPreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setReviewPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setReviewMessage("Review posted successfully.");
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : "Could not submit review.");
    } finally {
      setSavingReview(false);
    }
  };

  const stockLabel = stockCount === null ? "Available" : stockCount > 0 ? `Available (${stockCount} left)` : "Out of stock";

  return (
    <article className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4 rounded-4xl border border-border-color bg-background p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-6">
          <div className="overflow-hidden rounded-[28px] bg-muted">
            {activeImage ? (
              <img src={activeImage} alt={product.title} className="h-full w-full object-cover" style={{ aspectRatio: "4 / 5" }} />
            ) : (
              <div className="flex items-center justify-center bg-muted" style={{ aspectRatio: "4 / 5" }}>
                <span className="text-sm text-muted-foreground">No image available</span>
              </div>
            )}
          </div>

          {product.photos.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {product.photos.map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(photo)}
                  className={`overflow-hidden rounded-2xl border transition-colors ${activeImage === photo ? "border-black dark:border-white" : "border-border-color"}`}
                >
                  <img src={photo} alt={`${product.title} preview ${index + 1}`} className="h-20 w-full object-cover sm:h-24" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-4xl border border-border-color bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="rounded-full border border-border-color bg-muted px-3 py-1 text-[10px] tracking-[0.2em] text-foreground">{product.category}</span>
            {product.newArrival ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">New arrival</span> : null}
            {product.bestSelling ? <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">Best seller</span> : null}
            <span className={`rounded-full px-3 py-1 ${isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{stockLabel}</span>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{product.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StarRow rating={summary.average || product.ratingAverage} />
                <p className="text-sm text-muted-foreground">{ratingText}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium transition-all duration-300 ${isWishlisted ? "border-rose-300 bg-rose-50 text-rose-700" : "border-border-color bg-background text-foreground hover:border-black dark:hover:border-white hover:text-foreground"}`}
            >
              <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-current" : ""}`} />
              {isWishlisted ? "Saved" : "Add to wishlist"}
            </button>
          </div>

          <div className="mt-5 rounded-[28px] border border-border-color bg-muted p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">Tk {product.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">{isAvailable ? "Ready to ship when added to cart." : "This product is currently unavailable."}</p>
          </div>

          <div className="mt-5 space-y-5">
            <div id="about-product" className="scroll-mt-28">
              <p className="text-sm font-medium text-foreground">About product</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {product.description || "No product description has been added yet. Ask the admin to fill in the product details for this item."}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Color</p>
                {selectedColor ? <p className="text-xs text-muted-foreground">Selected: {selectedColor}</p> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {hasColorChoices ? (
                  product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${selectedColor === color ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black" : "border-border-color bg-background text-foreground hover:border-black dark:hover:border-white"}`}
                    >
                      {color}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">This product has a single color option.</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Quantity</p>
              <div className="mt-3 inline-flex items-center rounded-2xl border border-border-color bg-background">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="inline-flex h-12 w-12 items-center justify-center text-foreground transition-colors hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-14 px-4 text-center text-base font-medium text-foreground">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={stockCount !== null && quantity >= stockCount}
                  className="inline-flex h-12 w-12 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="primary"
                className="rounded-2xl"
                onClick={() => handleAddToCart(true)}
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                Buy now
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => handleAddToCart(false)}
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                Add to cart
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border-color bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
              >
                <Share2 className="h-4.5 w-4.5" />
                Share
              </button>
              <Link href="#reviews" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border-color bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground">
                <Send className="h-4.5 w-4.5" />
                Reviews
              </Link>
            </div>

            

            {sharingMessage ? <p className="text-sm text-muted-foreground">{sharingMessage}</p> : null}
            {reviewMessage && reviewMessage !== "Review posted successfully." ? <p className="text-sm text-rose-600">{reviewMessage}</p> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-4xl border border-border-color bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:grid-cols-2 sm:p-7 lg:grid-cols-4" aria-label="Product highlights">
        <ul className="contents">
        <li className="rounded-3xl bg-muted p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Category</p>
          <p className="mt-2 text-sm font-medium text-foreground">{product.category}</p>
        </li>
        <li className="rounded-3xl bg-muted p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stock</p>
          <p className="mt-2 text-sm font-medium text-foreground">{stockLabel}</p>
        </li>
        <li className="rounded-3xl bg-muted p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Colors</p>
          <p className="mt-2 text-sm font-medium text-foreground">{product.colors.length > 0 ? product.colors.join(", ") : "Single color"}</p>
        </li>
        <li className="rounded-3xl bg-muted p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reviews</p>
          <p className="mt-2 text-sm font-medium text-foreground">{ratingText}</p>
        </li>
        </ul>
      </section>

      <section id="reviews" className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-4xl border border-border-color bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reviews</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">What people said</h2>
          <div className="mt-4 flex items-center gap-3">
            <StarRow rating={summary.average || product.ratingAverage} />
            <p className="text-sm text-muted-foreground">{ratingText}</p>
          </div>

          <form onSubmit={submitReview} className="mt-6 space-y-4">
            <input
              value={reviewName}
              onChange={(event) => setReviewName(event.target.value)}
              placeholder="Your name"
              className="h-12 w-full rounded-2xl border border-border-color px-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
            />

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Rating</p>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  const active = reviewRating >= value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${active ? "border-amber-300 bg-amber-50 text-amber-500" : "border-border-color bg-background text-neutral-300 hover:border-neutral-300"}`}
                    >
                      <Star className={`h-4.5 w-4.5 ${active ? "fill-current" : ""}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Share your experience"
              rows={5}
              className="w-full rounded-2xl border border-border-color px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleReviewImagesChange}
              className="block w-full cursor-pointer rounded-2xl border border-border-color bg-background px-4 py-3 text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-black dark:file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:file:text-black hover:border-black dark:hover:border-white"
            />

            {reviewPreviews.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {reviewPreviews.map((preview, index) => (
                  <img key={`${preview}-${index}`} src={preview} alt={`Review preview ${index + 1}`} className="h-24 w-full rounded-2xl object-cover" />
                ))}
              </div>
            ) : null}

            <Button type="submit" variant="primary" className="w-full rounded-2xl" disabled={savingReview}>
              {savingReview ? <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
              {savingReview ? "Posting review..." : "Submit review"}
            </Button>
          </form>
        </div>

        <div className="rounded-4xl border border-border-color bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Customer reviews</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Recent feedback</h2>
            </div>
            <p className="text-sm text-muted-foreground">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
          </div>

          <div className="mt-6 space-y-5">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-[28px] border border-border-color bg-muted p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                    </div>
                    <StarRow rating={review.rating} />
                  </div>

                  {review.comment ? <p className="mt-3 text-sm leading-6 text-foreground">{review.comment}</p> : null}

                  {review.images.length > 0 ? (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {review.images.map((image, index) => (
                        <img key={`${review.id}-${index}`} src={image} alt={`${review.name} review ${index + 1}`} className="h-24 w-full rounded-2xl object-cover" />
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-neutral-300 bg-muted p-6 text-sm text-muted-foreground">
                No one has reviewed this product yet. Be the first to share what you think.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Similar Products</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Same style, same category</h2>
          </div>
        </div>

        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <ProductCard
                key={item.id}
                href={`/shop/${item.id}`}
                name={item.title}
                price={item.price}
                image={item.photos?.[0] ?? ""}
                alt={item.title}
                product={item}
                wishlistItem={{
                  key: `similar-${item.id}`,
                  id: item.id,
                  title: item.title,
                  image: item.photos?.[0] ?? "",
                  href: `/shop/${item.id}`,
                  cartItem: {
                    id: item.id,
                    key: item.id,
                    title: item.title,
                    price: item.price,
                    image: item.photos?.[0] ?? "",
                    photos: item.photos ?? [],
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-neutral-300 bg-muted p-6 text-sm text-muted-foreground">
            Similar products will appear here once the catalog has more items in the same category.
          </div>
        )}
      </section>

      <section className="mt-8 space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">You May Also Like</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">More items worth a look</h2>
          </div>
        </div>

        {recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {recommendedProducts.map((item) => (
              <ProductCard
                key={item.id}
                href={`/shop/${item.id}`}
                name={item.title}
                price={item.price}
                image={item.photos?.[0] ?? ""}
                alt={item.title}
                product={item}
                wishlistItem={{
                  key: `also-like-${item.id}`,
                  id: item.id,
                  title: item.title,
                  image: item.photos?.[0] ?? "",
                  href: `/shop/${item.id}`,
                  cartItem: {
                    id: item.id,
                    key: item.id,
                    title: item.title,
                    price: item.price,
                    image: item.photos?.[0] ?? "",
                    photos: item.photos ?? [],
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-neutral-300 bg-muted p-6 text-sm text-muted-foreground">
            We will show more product suggestions here as the catalog grows.
          </div>
        )}
      </section>
    </article>
  );
}