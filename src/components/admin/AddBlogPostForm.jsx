"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { BLOG_CATEGORY_SUGGESTIONS, BLOG_STATUS_OPTIONS, buildBlogSlug } from "@/lib/blog-shared";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

function createInitialForm(post) {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    category: post?.category ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    authorName: post?.authorName ?? "",
    metaTitle: post?.metaTitle ?? "",
    metaDescription: post?.metaDescription ?? "",
    coverAlt: post?.coverAlt ?? post?.title ?? "",
    coverImage: post?.coverImage ?? "",
    status: post?.status === "draft" ? "draft" : "published",
    featured: Boolean(post?.featured),
    publishedAt: post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : "",
  };
}

function toLocalDateTime(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 16) : "";
}

export default function AddBlogPostForm({ mode = "create", post = null, onSuccess }) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [form, setForm] = useState(() => createInitialForm(post));
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(post?.coverImage ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const slugTouchedRef = useRef(Boolean(post?.slug));
  const previewUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => {
      const next = { ...current, [name]: type === "checkbox" ? checked : value };

      if (name === "title" && !isEditMode && !slugTouchedRef.current) {
        next.slug = buildBlogSlug(value);
      }

      return next;
    });
  };

  const handleSlugChange = (event) => {
    slugTouchedRef.current = true;
    setForm((current) => ({ ...current, slug: event.target.value }));
  };

  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    try {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;
      setCoverFile(file);
      setCoverPreview(previewUrl);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load the selected image.");
    }
  };

  const clearCoverSelection = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setCoverFile(null);
    setCoverPreview(form.coverImage ?? "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const normalizedTitle = form.title.trim();
      const normalizedSlug = buildBlogSlug(normalizedTitle, form.slug.trim());
      const normalizedCategory = form.category.trim();
      const normalizedExcerpt = form.excerpt.trim();
      const normalizedContent = form.content.trim();
      const normalizedAuthor = form.authorName.trim();
      const normalizedCoverImage = form.coverImage.trim();

      if (!normalizedTitle || !normalizedSlug || !normalizedCategory || !normalizedExcerpt || !normalizedContent || !normalizedAuthor) {
        throw new Error("Title, slug, category, excerpt, author, and content are required.");
      }

      const payload = new FormData();
      payload.append("title", normalizedTitle);
      payload.append("slug", normalizedSlug);
      payload.append("category", normalizedCategory);
      payload.append("excerpt", normalizedExcerpt);
      payload.append("content", normalizedContent);
      payload.append("authorName", normalizedAuthor);
      payload.append("metaTitle", form.metaTitle.trim());
      payload.append("metaDescription", form.metaDescription.trim());
      payload.append("coverAlt", form.coverAlt.trim());
      payload.append("status", form.status);
      payload.append("featured", String(form.featured));
      payload.append("publishedAt", form.publishedAt ? new Date(form.publishedAt).toISOString() : "");

      if (coverFile) {
        payload.append("coverImage", String(await fileToDataUrl(coverFile)));
      } else if (normalizedCoverImage) {
        payload.append("coverImage", normalizedCoverImage);
      }

      const endpoint = isEditMode && post?.id ? `/api/blog-posts/${post.id}` : "/api/blog-posts";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isEditMode ? "Could not update the post." : "Could not add the post."));
      }

      setMessage(isEditMode ? "Blog post updated successfully." : "Blog post created successfully.");

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }

      setCoverFile(null);
      setForm(createInitialForm(null));
      setCoverPreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      router.refresh();
      onSuccess?.(data.post);
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
          <h2 className="text-lg font-semibold text-foreground">{isEditMode ? "Edit Blog Post" : "Add Blog Post"}</h2>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update the article content, metadata, and publishing state." : "Create a search-friendly article for the blog."}
          </p>
        </div>
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl border border-border-color bg-muted px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Post title"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />

        <input
          name="slug"
          value={form.slug}
          onChange={handleSlugChange}
          placeholder="seo-friendly-slug"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
        />

        <input
          name="authorName"
          value={form.authorName}
          onChange={handleChange}
          placeholder="Author name"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
        />

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          list="blog-category-suggestions"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
        />

        <input
          name="publishedAt"
          type="datetime-local"
          value={form.publishedAt}
          onChange={handleChange}
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 focus:border-black dark:focus:border-white"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 focus:border-black dark:focus:border-white"
        >
          {BLOG_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>

        <input
          name="metaTitle"
          value={form.metaTitle}
          onChange={handleChange}
          placeholder="Meta title"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />

        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          placeholder="Short excerpt for the blog card and search results"
          rows={3}
          className="min-h-28 rounded-2xl border border-border-color px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />

        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Write the article body here. Blank lines become new paragraphs."
          rows={12}
          className="min-h-64 rounded-2xl border border-border-color px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />

        <input
          name="metaDescription"
          value={form.metaDescription}
          onChange={handleChange}
          placeholder="Meta description"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />

        <input
          name="coverAlt"
          value={form.coverAlt}
          onChange={handleChange}
          placeholder="Cover image alt text"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />

        <input
          name="coverImage"
          value={form.coverImage}
          onChange={handleChange}
          placeholder="Cover image URL (optional if uploading a file below)"
          className="h-14 rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white md:col-span-2"
        />
      </div>

      <div className="mt-5 grid gap-3 rounded-3xl border border-border-color bg-muted p-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border-color bg-background px-4 py-3 text-sm font-medium text-foreground">
          <span>Featured post</span>
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
            className="h-4 w-4 accent-black"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border-color bg-background px-4 py-3 text-sm font-medium text-foreground">
          <span>Publish now</span>
          <input
            type="checkbox"
            checked={form.status === "published"}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.checked ? "published" : "draft" }))}
            className="h-4 w-4 accent-black"
          />
        </label>
      </div>

      <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-muted p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Cover image</p>
            <p className="text-xs text-muted-foreground">Upload an image or keep the current URL. The preview updates immediately.</p>
          </div>

          {(coverPreview || form.coverImage) ? (
            <button
              type="button"
              onClick={clearCoverSelection}
              className="inline-flex items-center gap-2 self-start rounded-full border border-border-color bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear preview
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-border-color bg-background">
          <div className="relative aspect-video bg-muted">
            {(coverPreview || form.coverImage) ? (
              <Image
                src={coverPreview || form.coverImage}
                alt={form.coverAlt || form.title || "Blog cover image"}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No cover image selected
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border-color p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-color bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white">
              <Upload className="h-4 w-4" />
              Choose file
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>

            {coverFile ? <p className="text-xs text-muted-foreground">Selected: {coverFile.name}</p> : null}
          </div>
        </div>
      </div>

      <datalist id="blog-category-suggestions">
        {BLOG_CATEGORY_SUGGESTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Use the title, excerpt, meta fields, and a clean slug for the best SEO results.
        </p>

        <Button type="submit" variant="primary" className="rounded-xl px-5" disabled={saving}>
          {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {isEditMode ? "Save changes" : "Publish post"}
        </Button>
      </div>
    </form>
  );
}
