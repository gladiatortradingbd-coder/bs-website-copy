"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";

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
  const [newCategory, setNewCategory] = useState({ title: "", file: null, preview: "" });
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

  const handleNewCategoryFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }
    setNewCategory((current) => {
      if (current.preview) URL.revokeObjectURL(current.preview);
      return { ...current, file, preview: URL.createObjectURL(file) };
    });
  };

  const handleCreate = async () => {
    const title = newCategory.title.trim();
    if (!title || !newCategory.file) {
      setMessage("Enter a category title and choose an image.");
      return;
    }

    setSavingSlug("__new__");
    setMessage("");
    try {
      const payload = new FormData();
      payload.append("title", title);
      payload.append("photo", String(await fileToDataUrl(newCategory.file)));
      const response = await fetch("/api/category-images", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not create category.");
      setCategories((current) => [...current, data.category]);
      setNewCategory({ title: "", file: null, preview: "" });
      setMessage(`${title} category created.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create category.");
    } finally {
      setSavingSlug("");
    }
  };

  const handleDelete = async (slug, title) => {
    if (!window.confirm(`Delete the ${title} category?`)) return;
    setSavingSlug(slug);
    setMessage("");
    try {
      const response = await fetch(`/api/category-images?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete category.");
      setCategories((current) => current.filter((category) => category.slug !== slug));
      setMessage(`${title} category deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete category.");
    } finally {
      setSavingSlug("");
    }
  };

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
    const storedCategory = categoryMap.get(slug);
    const category = storedCategory;
    const file = selectedFiles[slug];
    const title = editedTitles[slug] ?? category?.title ?? "";

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
      payload.append("slug", category.slug);
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

      <div className="mt-5 rounded-[24px] border border-dashed border-emerald-300 bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
        <div className="flex items-start gap-3">
          <Plus className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <h3 className="font-semibold text-foreground">Add a new category</h3>
            <p className="mt-1 text-sm text-muted-foreground">New categories automatically get their own shop filter and product category option.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Category title
            <input
              type="text"
              value={newCategory.title}
              maxLength={80}
              onChange={(event) => setNewCategory((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 h-11 w-full rounded-xl border border-border-color bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-emerald-600"
              placeholder="e.g. Hanging Baskets"
            />
          </label>
          <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border-color bg-background px-3 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span className="truncate">{newCategory.file?.name || "Choose category image"}</span>
            <input type="file" accept="image/*" onChange={handleNewCategoryFile} className="hidden" />
          </label>
          <Button type="button" variant="primary" className="h-11 justify-center rounded-xl" onClick={handleCreate} disabled={savingSlug === "__new__"}>
            {savingSlug === "__new__" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add category
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {categories.map((category) => {
          const storedCategory = categoryMap.get(category.slug);
          const previewUrl = previewUrls[category.slug];
          const imageSrc = previewUrl || storedCategory?.image || category.image;
          const title = editedTitles[category.slug] ?? category.title;
          const isSaving = savingSlug === category.slug;
          const hasPendingFile = Boolean(selectedFiles[category.slug]);
          const hasChanges = hasPendingFile || title.trim() !== category.title;
          const isDefault = !category.updatedAt && ["plants", "soil", "planters", "garden-accessories", "air-plant-holders"].includes(category.slug);

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

                  {category.updatedAt ? (
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
                  {!isDefault ? (
                    <Button type="button" variant="ghost" className="rounded-xl px-3 text-red-700" onClick={() => handleDelete(category.slug, title)} disabled={isSaving}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete {title}</span>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}