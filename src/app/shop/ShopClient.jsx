"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { getCategoryDisplayName } from "@/lib/categories";
import PriceFilterSidebar from "@/components/shop/PriceFilterSidebar";

export default function ShopClient() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") ?? searchParams.get("search") ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const showNewArrivals = ["1", "true"].includes(String(searchParams.get("newArrival") ?? "").trim().toLowerCase());
  const query = rawQuery.trim();
  const categoryLabel = getCategoryDisplayName(selectedCategory);
  const viewLabel = showNewArrivals ? "New arrivals" : "All products";
  const resetLabel = showNewArrivals ? "Browse all products" : "Back to all products";
  const hasPriceFilter = Boolean(maxPrice.trim());
  const priceLabel = maxPrice.trim() ? `৳ 0 — ৳ ${maxPrice.trim()}` : "";
  const pageSize = 15;
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const resultsRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [maxPrice, query, selectedCategory, showNewArrivals]);

  useEffect(() => {
    let ignore = false;
    const nextParams = new URLSearchParams({
      limit: String(pageSize),
      page: String(page),
    });

    if (query) {
      nextParams.set("search", query);
    }

    if (selectedCategory) {
      nextParams.set("category", selectedCategory);
    }

    if (showNewArrivals) {
      nextParams.set("newArrival", "1");
    }

    if (maxPrice.trim()) {
      nextParams.set("maxPrice", maxPrice.trim());
    }

    Promise.resolve().then(() => {
      if (!ignore) {
        setIsLoading(true);
        setErrorMessage("");
      }
    });

    fetch(`/api/products?${nextParams.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        return response.json();
      })
      .then((data) => {
        if (ignore) {
          return;
        }

        setProducts(Array.isArray(data?.products) ? data.products : []);
        const nextTotal = Number(data?.total);
        setTotalCount(Number.isFinite(nextTotal) ? nextTotal : 0);
        const nextPage = Number(data?.page);
        if (Number.isFinite(nextPage) && nextPage > 0 && nextPage !== page) {
          setPage(nextPage);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setProducts([]);
          setTotalCount(0);
          setErrorMessage(error instanceof Error ? error.message : "Could not load products.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [maxPrice, page, pageSize, query, selectedCategory, showNewArrivals]);

  const totalPages = useMemo(() => {
    if (totalCount === 0) {
      return 1;
    }

    return Math.ceil(totalCount / pageSize);
  }, [pageSize, totalCount]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const showPagination = !isLoading && totalCount > 0;
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const emptyState = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (errorMessage) {
      return (
        <div className="mt-10 flex flex-col items-start gap-4 rounded-[28px] border border-dashed border-neutral-300 bg-muted p-6 sm:p-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-foreground shadow-sm">
            <SearchX className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Could not load products</h2>
            <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-black dark:bg-white px-5 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.02]"
          >
            Retry
          </Link>
        </div>
      );
    }

    if (products.length > 0) {
      return null;
    }

    return (
      <div className="mt-10 flex flex-col items-start gap-4 rounded-[28px] border border-dashed border-neutral-300 bg-muted p-6 sm:p-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-foreground shadow-sm">
          <SearchX className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">No matching products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {query
              ? `Nothing matches “${query}”.`
              : selectedCategory && selectedCategory.toLowerCase() !== "all"
                ? `Nothing found in ${categoryLabel}.`
                : "Try a different search."}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-black dark:bg-white px-5 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.02]"
        >
          {resetLabel}
        </Link>
      </div>
    );
  }, [categoryLabel, errorMessage, isLoading, products.length, query, resetLabel, selectedCategory]);

  return (
    <>
      <section className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start" aria-label="Shop results">
        <aside className="lg:sticky lg:top-6">
          <PriceFilterSidebar key={`${maxPrice || "default"}|${selectedCategory || "all"}`} />
        </aside>

        <div ref={resultsRef}>
          <header className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border-color bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
              {viewLabel}
            </div>
            {hasPriceFilter ? (
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                Price: {priceLabel}
              </div>
            ) : null}
            {showNewArrivals ? (
              <Link href="/shop" className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
                Clear filter
              </Link>
            ) : null}
          </header>

          {isLoading ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4" aria-label="Loading products">
              {Array.from({ length: 8 }).map((_, index) => (
                <li key={index} className="animate-pulse overflow-hidden rounded-2xl border border-border-color bg-muted sm:rounded-3xl">
                  <div className="aspect-4/5 w-full bg-muted" />
                  <div className="space-y-3 p-3 sm:p-4">
                    <div className="h-4 w-3/4 rounded-full bg-muted" />
                    <div className="h-3 w-1/2 rounded-full bg-muted" />
                    <div className="h-4 w-1/3 rounded-full bg-muted" />
                  </div>
                </li>
              ))}
            </ul>
          ) : products.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4" aria-label="Products">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    href={`/shop/${product.id}`}
                    name={product.title}
                    price={product.price}
                    image={product.photos?.[0] ?? ""}
                    alt={product.title}
                    product={product}
                    wishlistItem={{
                      key: `shop-${product.id}`,
                      id: product.id,
                      title: product.title,
                      image: product.photos?.[0] ?? "",
                      href: `/shop/${product.id}`,
                      cartItem: {
                        id: product.id,
                        key: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.photos?.[0] ?? "",
                        photos: product.photos ?? [],
                      },
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            emptyState
          )}

          {showPagination ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-color pt-4">
              <p className="text-xs text-muted-foreground">
                Showing {startIndex}-{endIndex} of {totalCount}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!canGoPrev}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-border-color px-4 text-xs font-medium text-foreground transition disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handlePageChange(Math.max(page - 1, 1))}
                  >
                    Prev
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={!canGoNext}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-border-color px-4 text-xs font-medium text-foreground transition disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
