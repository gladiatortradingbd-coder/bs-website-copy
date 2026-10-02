"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Edit, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import AddBlogPostForm from "@/components/admin/AddBlogPostForm";

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function AdminBlogPanel({ initialPosts }) {
  const [posts, setPosts] = useState(() => initialPosts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState({ isOpen: false, mode: "create", post: null });
  const [message, setMessage] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const statusMatches = statusFilter === "all" || post.status === statusFilter;

      if (!statusMatches) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [post.title, post.slug, post.category, post.excerpt, post.authorName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [posts, query, statusFilter]);

  const openCreateModal = () => {
    setModalState({ isOpen: true, mode: "create", post: null });
  };

  const openEditModal = (post) => {
    setModalState({ isOpen: true, mode: "edit", post });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "create", post: null });
  };

  const handleSavedPost = (savedPost) => {
    if (!savedPost) {
      return;
    }

    setPosts((currentPosts) => {
      const nextPosts = [...currentPosts];
      const postIndex = nextPosts.findIndex((item) => item.id === savedPost.id);

      if (postIndex >= 0) {
        nextPosts[postIndex] = savedPost;
        return nextPosts;
      }

      return [savedPost, ...nextPosts];
    });

    setMessage(modalState.mode === "edit" ? "Blog post updated." : "Blog post created.");
    closeModal();
  };

  const handleDelete = async (post) => {
    const confirmed = window.confirm(`Delete ${post.title}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/blog-posts/${post.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete the post.");
      }

      setPosts((currentPosts) => currentPosts.filter((item) => item.id !== post.id));
      setMessage("Blog post deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete the post.");
    }
  };

  const modal = modalState.isOpen ? (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 dark:bg-white/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[28px] bg-background shadow-[0_30px_100px_rgba(0,0,0,0.2)]">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-color bg-background text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
          aria-label="Close blog post form"
        >
          <span className="text-xl leading-none">×</span>
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <AddBlogPostForm
            key={`${modalState.mode}-${modalState.post?.id ?? "new"}`}
            mode={modalState.mode}
            post={modalState.post}
            onSuccess={handleSavedPost}
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
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Blog posts</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Manage SEO content</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, edit, delete, and publish blog articles from one place.
            </p>
          </div>

          <div className="w-full sm:max-w-md">
            <SearchBar
              placeholder="Search blog posts..."
              className="w-full bg-background"
              compact
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={statusFilter === option.value ? "primary" : "outline"}
              className="rounded-xl px-4"
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl border border-border-color bg-background px-4 py-3 text-sm text-foreground">
            {message}
          </p>
        ) : null}
      </div>

        <div className="flex justify-start">
          <Button type="button" variant="primary" className="rounded-xl px-5" onClick={openCreateModal}>
            <Plus className="h-4.5 w-4.5" />
            Add post
          </Button>
        </div>

        <div className="rounded-3xl border border-border-color bg-muted p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current library</p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">Saved blog posts</h3>
          </div>
          <p className="text-sm text-muted-foreground">{filteredPosts.length} posts</p>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredPosts.map((post) => (
              <div key={post.id} className="overflow-hidden rounded-3xl border border-border-color bg-background shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="relative aspect-video bg-muted">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt || post.title}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate text-base font-semibold text-foreground">{post.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{post.category}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      {post.featured ? <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Featured</span> : null}
                      <span className={`rounded-full px-2 py-1 ${post.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-foreground"}`}>
                        {post.status}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{post.authorName}</span>
                    <span>{post.readingTime} min read</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-center rounded-xl border-border-color px-4 sm:w-auto"
                      onClick={() => openEditModal(post)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-center rounded-xl border-red-200 px-4 text-red-600 hover:border-red-500 hover:text-red-700 sm:w-auto"
                      onClick={() => handleDelete(post)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-background px-4 py-8 text-center text-sm text-muted-foreground">
            No blog posts match your search.
          </div>
        )}
        </div>
      </div>

      {typeof window !== "undefined" && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}
