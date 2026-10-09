"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [editedTitles, setEditedTitles] = useState({});
  const [savingSlug, setSavingSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const previewUrlsRef = useRef({});

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
      Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

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
    const storedCategory = categoryMap.get(slug);
    const title = editedTitles[slug] ?? storedCategory?.title ?? category?.title ?? "";

    if (!category) {
      setMessage("Unknown category.");
      return;
    }

    if (!title.trim()) {
      setMessage("Category title cannot be empty.");
      return;
    }

    setSavingSlug(slug);
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("slug", slug);
      payload.append("title", title.trim());
      if (file) {
        payload.append("photo", String(await fileToDataUrl(file)));
      }

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

      setMessage(`${title.trim()} category updated.`);
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
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Category content</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Home page category cards</h2>
          <p className="mt-1 text-sm text-muted-foreground">Update the image and title for each category shown on the home page.</p>
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
          const title = editedTitles[category.slug] ?? storedCategory?.title ?? category.title;
          const isSaving = savingSlug === category.slug;
          const hasPendingFile = Boolean(selectedFiles[category.slug]);
          const hasChanges = hasPendingFile || title.trim() !== (storedCategory?.title ?? category.title);

          return (
            <div key={category.slug} className="overflow-hidden rounded-[24px] border border-border-color bg-muted">
              <div className="relative aspect-[4/3] bg-muted">
                <Image src={imageSrc} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
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

                <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Category title
                  <input
                    type="text"
                    value={title}
                    maxLength={80}
                    onChange={(event) =>
                      setEditedTitles((current) => ({ ...current, [category.slug]: event.target.value }))
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-border-color bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition focus:border-emerald-600"
                  />
                </label>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1 justify-center rounded-xl"
                    onClick={() => handleSave(category.slug)}
                    disabled={isSaving || !hasChanges}
                  >
                    {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Save changes
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