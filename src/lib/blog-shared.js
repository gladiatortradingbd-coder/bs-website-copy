const BLOG_STATUS_OPTIONS = ["draft", "published"];

const BLOG_CATEGORY_SUGGESTIONS = [
  "Care Guides",
  "Saree Styling",
  "Seasonal Tips",
  "Saree Care",
  "News",
  "Resources",
];

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildBlogSlug(title, providedSlug = "") {
  return slugify(providedSlug || title);
}

export { BLOG_CATEGORY_SUGGESTIONS, BLOG_STATUS_OPTIONS, buildBlogSlug, slugify };
