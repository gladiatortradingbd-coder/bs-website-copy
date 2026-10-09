"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, X } from "lucide-react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

function revokePhotoItem(item) {
  if (item.type === "file") {
    URL.revokeObjectURL(item.preview);
  }
}

function createPhotoItem(photo, index) {
  return {
    id: `existing-${index}-${photo}`,
    type: "existing",
    value: photo,
    preview: photo,
  };
}

function createFilePhotoItem(file) {
  return {
    id: `file-${crypto.randomUUID()}`,
    type: "file",
    value: file,
    preview: URL.createObjectURL(file),
  };
}

function createInitialForm(product) {
  return {
    title: product?.title ?? "",
    category: product?.category ?? "",
    price: product?.price ?? "",
    description: product?.description ?? "",
    colors: Array.isArray(product?.colors) ? product.colors.join(", ") : String(product?.colors ?? ""),
    stock: product?.stock ?? "",
    weight: product?.weight ?? "",
    bestSelling: Boolean(product?.bestSelling),
    newArrival: Boolean(product?.newArrival),
  };
}

export default function AddProductForm({ mode = "create", product = null, onSuccess }) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState(() => createInitialForm(product));
  const [photoItems, setPhotoItems] = useState(() =>
    (Array.isArray(product?.photos) ? product.photos : []).map((photo, index) => createPhotoItem(photo, index)),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const fileInputRef = useRef(null);
  const photoItemsRef = useRef(photoItems);

  useEffect(() => {
    photoItemsRef.current = photoItems;
  }, [photoItems]);

  useEffect(() => {
    let ignore = false;
    fetch("/api/category-images", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!ignore && Array.isArray(data.categories)) {
          setCategoryOptions(data.categories.map((category) => category.title).filter(Boolean));
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      photoItemsRef.current.forEach((item) => revokePhotoItem(item));
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoChange = async (event) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const nextItems = [];

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select image files only.");
        }

        nextItems.push(createFilePhotoItem(file));
      }

      setPhotoItems((currentItems) => [...currentItems, ...nextItems]);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load the selected files.");
      nextItems.forEach((item) => revokePhotoItem(item));
    }

    event.target.value = "";
  };

  const removePhoto = (photoId) => {
    setPhotoItems((currentItems) => {
      const nextItems = currentItems.filter((item) => item.id !== photoId);
      const removedItem = currentItems.find((item) => item.id === photoId);

      if (removedItem) {
        revokePhotoItem(removedItem);
      }

      return nextItems;
    });
  };

  const movePhoto = (photoId, direction) => {
    setPhotoItems((currentItems) => {
      const currentIndex = currentItems.findIndex((item) => item.id === photoId);

      if (currentIndex < 0) {
        return currentItems;
      }

      const targetIndex = currentIndex + direction;

      if (targetIndex < 0 || targetIndex >= currentItems.length) {
        return currentItems;
      }

      const nextItems = [...currentItems];
      const [movedItem] = nextItems.splice(currentIndex, 1);
      nextItems.splice(targetIndex, 0, movedItem);
      return nextItems;
    });
  };

  const clearPhotos = () => {
    photoItemsRef.current.forEach((item) => revokePhotoItem(item));
    setPhotoItems([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    clearPhotos();
    setForm(createInitialForm(null));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (!form.title.trim() || !form.category.trim()) {
        throw new Error("Product title and category are required.");
      }

      const parsedPrice = Number(form.price);

      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Please enter a valid price.");
      }

      const rawStock = String(form.stock ?? "").trim();
      const parsedStock = rawStock === "" ? null : Number(rawStock);

      if (rawStock !== "" && (!Number.isInteger(parsedStock) || parsedStock < 0)) {
        throw new Error("Please enter a valid stock count.");
      }

      const isMediaCategory = form.category.trim().toLowerCase() === "media";
      const rawWeight = String(form.weight ?? "").trim();
      const parsedWeight = rawWeight === "" ? null : Number(rawWeight);

      if (isMediaCategory && rawWeight !== "" && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
        throw new Error("Please enter a valid weight in kg for Media products.");
      }

      if (!photoItemsRef.current.length) {
        throw new Error("Please select at least one photo.");
      }

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("category", form.category.trim());
      payload.append("price", String(parsedPrice));
      payload.append("description", form.description.trim());
      payload.append("colors", form.colors.trim());
      payload.append("stock", rawStock);
      payload.append("weight", rawWeight);
      payload.append("bestSelling", String(form.bestSelling));
      payload.append("newArrival", String(form.newArrival));
      const photoSources = await Promise.all(
        photoItemsRef.current.map(async (item) => {
          if (item.type === "existing") {
            return item.value;
          }

          return fileToDataUrl(item.value);
        }),
      );

      for (const photo of photoSources) {
        payload.append("photos", photo);
      }

      const endpoint = isEditMode && product?.id ? `/api/products/${product.id}` : "/api/products";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isEditMode ? "Could not update the product." : "Could not add the product."));
      }

      setMessage(isEditMode ? "Product updated successfully." : "Product added successfully.");
      resetForm();
      router.refresh();
      onSuccess?.(data.product);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-start gap-3 border-b border-neutral-100 pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
          <ImagePlus className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{isEditMode ? "Edit Product" : "Add Product"}</h2>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update the product details, pricing, stock, and photos." : "Create a new catalog item for the shop page."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Product title"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 focus:border-black dark:focus:border-white"
        >
          <option value="">Product category</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          name="price"
          type="number"
          min="1"
          step="1"
          value={form.price}
          onChange={handleChange}
          placeholder="Price in Tk"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
        />
        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock quantity"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
        />
        {form.category === "Media" && (
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Weight per unit (kg) — used to calculate delivery surcharge
            </label>
            <input
              name="weight"
              type="number"
              min="0.1"
              step="0.1"
              value={form.weight}
              onChange={handleChange}
              placeholder="e.g. 2.5"
              className="h-14 w-full rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              First 1 kg is free. Each extra whole kg adds ৳20 to delivery.
            </p>
          </div>
        )}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product description"
          rows={4}
          className="min-h-36 rounded-2xl border border-border-color px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />
        <input
          name="colors"
          value={form.colors}
          onChange={handleChange}
          placeholder="Colors, separated by commas"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />
      </div>

      <div className="mt-5 grid gap-3 rounded-3xl border border-border-color bg-muted p-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border-color bg-background px-4 py-3 text-sm font-medium text-foreground">
          <span>Best selling</span>
          <input
            type="checkbox"
            checked={form.bestSelling}
            onChange={(event) => setForm((current) => ({ ...current, bestSelling: event.target.checked }))}
            className="h-4 w-4 accent-black"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border-color bg-background px-4 py-3 text-sm font-medium text-foreground">
          <span>New arrivals</span>
          <input
            type="checkbox"
            checked={form.newArrival}
            onChange={(event) => setForm((current) => ({ ...current, newArrival: event.target.checked }))}
            className="h-4 w-4 accent-black"
          />
        </label>
      </div>

      <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-muted p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Product photos</p>
            <p className="text-xs text-muted-foreground">Select as many images as you need, then reorder or remove each one.</p>
          </div>

          {photoItems.length > 0 && (
            <button
              type="button"
              onClick={clearPhotos}
              className="inline-flex items-center gap-2 self-start rounded-full border border-border-color bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear photos
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="mt-4 block w-full cursor-pointer rounded-2xl border border-border-color bg-background px-4 py-3 text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-black dark:file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:file:text-black hover:border-black dark:hover:border-white"
        />

        {photoItems.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photoItems.map((photoItem, index) => (
              <div key={photoItem.id} className="overflow-hidden rounded-2xl border border-border-color bg-background">
                <div className="relative h-28 w-full">
                  <Image
                    src={photoItem.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-2">
                    <span className="rounded-full bg-black/70 dark:bg-white/70 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white dark:text-black">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photoItem.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-foreground"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-2">
                    <button
                      type="button"
                      onClick={() => movePhoto(photoItem.id, -1)}
                      disabled={index === 0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move photo ${index + 1} left`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(photoItem.id, 1)}
                      disabled={index === photoItems.length - 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move photo ${index + 1} right`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <p className="mt-5 rounded-2xl border border-border-color bg-muted px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-black dark:bg-white px-6 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : isEditMode ? (
            "Update product"
          ) : (
            "Add product"
          )}
        </button>
      </div>
    </form>
  );
}