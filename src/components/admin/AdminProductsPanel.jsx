"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Edit, Plus, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import AddProductForm from "@/components/admin/AddProductForm";

const PRODUCTS_PER_PAGE = 6;

export default function AdminProductsPanel({ initialProducts }) {
  const [products, setProducts] = useState(() => initialProducts);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalState, setModalState] = useState({ isOpen: false, mode: "create", product: null });
  const [message, setMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      return [product.title, product.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [products, query]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const activePage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (activePage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [activePage, filteredProducts]);

  const formatPrice = (price) => {
    if (typeof price === "number") {
      return `Tk ${price}`;
    }

    if (typeof price === "string" && price.trim()) {
      return price.startsWith("Tk ") ? price : `Tk ${price}`;
    }

    return "";
  };

  const openCreateModal = () => {
    setModalState({ isOpen: true, mode: "create", product: null });
  };

  const openEditModal = (product) => {
    setModalState({ isOpen: true, mode: "edit", product });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "create", product: null });
  };

  const handleSavedProduct = (savedProduct) => {
    if (!savedProduct) {
      return;
    }

    setProducts((currentProducts) => {
      const nextProducts = [...currentProducts];
      const productIndex = nextProducts.findIndex((item) => item.id === savedProduct.id);

      if (productIndex >= 0) {
        nextProducts[productIndex] = savedProduct;
        return nextProducts;
      }

      return [savedProduct, ...nextProducts];
    });
    setMessage(modalState.mode === "edit" ? "Product updated." : "Product created.");
    closeModal();
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete ${product.title}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete the product.");
      }

      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id));
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete the product.");
    }
  };

  const modal = modalState.isOpen ? (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 dark:bg-white/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] bg-background shadow-[0_30px_100px_rgba(0,0,0,0.2)]">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-color bg-background text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
          aria-label="Close product form"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] sm:p-6 sm:pb-6">
          <AddProductForm
            key={`${modalState.mode}-${modalState.product?.id ?? "new"}`}
            mode={modalState.mode}
            product={modalState.product}
            onSuccess={handleSavedProduct}
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-border-color bg-muted p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Products</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Manage catalog</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, edit, delete, and create products from one place.
            </p>
          </div>

          <div className="w-full sm:max-w-md">
            <Suspense fallback={null}>
              <SearchBar
                placeholder="Search products..."
                className="w-full bg-background"
                compact
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </Suspense>
          </div>
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl border border-border-color bg-background px-4 py-3 text-sm text-foreground">
            {message}
          </p>
        ) : null}
      </div>

        <div className="flex justify-start">
          <Button
            type="button"
            variant="primary"
            className="rounded-xl px-5"
            onClick={openCreateModal}
          >
            <Plus className="h-4.5 w-4.5" />
            Add product
          </Button>
        </div>

        <div className="rounded-3xl border border-border-color bg-muted p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current catalog</p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">Saved products</h3>
          </div>
          <p className="text-sm text-muted-foreground">{filteredProducts.length} products</p>
        </div>

        {filteredProducts.length > 0 ? (
          <>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-3xl border border-border-color bg-background shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted sm:w-32 sm:shrink-0 sm:aspect-square">
                    {product.photos[0] ? (
                      <Image
                        src={product.photos[0]}
                        alt={product.title}
                        fill
                        unoptimized
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold text-foreground">{product.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                      </div>

                      <p className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      {product.bestSelling ? <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Best selling</span> : null}
                      {product.newArrival ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">New arrival</span> : null}
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">{product.photos.length} photo(s)</p>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-center rounded-xl border-border-color px-4 sm:w-auto"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-center rounded-xl border-red-200 px-4 text-red-600 hover:border-red-500 hover:text-red-700 sm:w-auto"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Page {activePage} of {totalPages}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-border-color px-4"
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={activePage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    type="button"
                    variant={pageNumber === activePage ? "primary" : "outline"}
                    className="h-10 min-w-10 rounded-xl px-3"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-border-color px-4"
                  onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  disabled={activePage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
          </>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-background px-4 py-8 text-center text-sm text-muted-foreground">
            No products match your search.
          </div>
        )}
        </div>
      </div>

      {typeof window !== "undefined" && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}