"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { HOMEPAGE_CATEGORY_CARDS } from "@/lib/categories";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

export default function CategoryImagesPanel() {
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [savingSlug, setSavingSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.slug, category])), [categories]);

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/category-images");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load category images.");
        }

        if (!ignore) {
          setCategories(Array.isArray(data.categories) ? data.categories : []);
        }
      } catch (error) {
        if (!ignore) {
          setCategories([]);
          setMessage(error instanceof Error ? error.message : "Could not load category images.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      ignore = true;
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFileChange = (slug) => (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    setMessage("");
    setSelectedFiles((current) => ({ ...current, [slug]: file }));
    setPreviewUrls((current) => {
      const next = { ...current };

      if (next[slug]) {
        URL.revokeObjectURL(next[slug]);
      }

      next[slug] = URL.createObjectURL(file);
      return next;
    });
  };

  const handleSave = async (slug) => {
    const file = selectedFiles[slug];
    const category = HOMEPAGE_CATEGORY_CARDS.find((item) => item.slug === slug);

    if (!file || !category) {
      setMessage("Choose a category image first.");
      return;
    }

    setSavingSlug(slug);
    setMessage("");

    try {
      const photo = await fileToDataUrl(file);
      const payload = new FormData();
      payload.append("slug", slug);
      payload.append("title", category.title);
      payload.append("photo", String(photo));

      const response = await fetch("/api/category-images", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save category image.");
      }

      setCategories((current) => {
        const next = current.filter((item) => item.slug !== slug);
        return [...next, data.category].sort((left, right) => left.slug.localeCompare(right.slug));
      });

      setMessage(`${category.title} image updated.`);
      setSelectedFiles((current) => {
        const next = { ...current };
        delete next[slug];
        return next;
      });

      setPreviewUrls((current) => {
        const next = { ...current };
        if (next[slug]) {
          URL.revokeObjectURL(next[slug]);
        }
        delete next[slug];
        return next;
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save category image.");
    } finally {
      setSavingSlug("");
    }
  };

  return (
    <section className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-start gap-3 border-b border-neutral-100 pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
          <ImagePlus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Category images</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Home page category visuals</h2>
          <p className="mt-1 text-sm text-muted-foreground">Upload a picture for each category card shown on the home page.</p>
        </div>
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl border border-border-color bg-muted px-4 py-3 text-sm text-foreground">{message}</p>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {HOMEPAGE_CATEGORY_CARDS.map((category) => {
          const storedCategory = categoryMap.get(category.slug);
          const previewUrl = previewUrls[category.slug];
          const imageSrc = previewUrl || storedCategory?.image || category.image;
          const isSaving = savingSlug === category.slug;
          const hasPendingFile = Boolean(selectedFiles[category.slug]);

          return (
            <div key={category.slug} className="overflow-hidden rounded-[24px] border border-border-color bg-muted">
              <div className="relative aspect-[4/3] bg-muted">
                <Image src={imageSrc} alt={category.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{category.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Slug: {category.slug}</p>
                  </div>

                  {storedCategory?.updatedAt ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Saved
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                      Default
                    </span>
                  )}
                </div>

                <label className="mt-4 flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-neutral-300 bg-background px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <Upload className="h-4 w-4" />
                    {hasPendingFile ? selectedFiles[category.slug].name : "Choose new image"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange(category.slug)} className="hidden" />
                </label>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1 justify-center rounded-xl"
                    onClick={() => handleSave(category.slug)}
                    disabled={isSaving || !hasPendingFile}
                  >
                    {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Save image
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}