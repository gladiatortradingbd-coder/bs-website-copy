import clientPromise from "@/lib/mongodb";
import { HOMEPAGE_CATEGORY_CARDS } from "@/lib/categories";

function mapStoredCategory(category, fallback) {
  return {
    slug: fallback.slug,
    title: String(category?.title ?? "").trim() || fallback.title,
    href: fallback.href,
    image: category?.image || fallback.image,
    updatedAt: category?.updatedAt ?? null,
  };
}

export async function getHomepageCategoryCards() {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("category_images");
    const records = await collection.find({}).toArray();
    const bySlug = new Map(records.map((record) => [String(record.slug ?? "").trim(), record]));

    const storedCategories = records
      .map((record) => {
        const slug = String(record.slug ?? "").trim();
        const fallback = HOMEPAGE_CATEGORY_CARDS.find((item) => item.slug === slug);

        return fallback
          ? mapStoredCategory(record, fallback)
          : {
              slug,
              title: String(record.title ?? "").trim(),
              href: `/shop?category=${encodeURIComponent(slug)}`,
              image: String(record.image ?? "").trim(),
              updatedAt: record.updatedAt ?? null,
            };
      })
      .filter((category) => category.slug && category.title && category.image);

    const storedSlugs = new Set(storedCategories.map((category) => category.slug));
    const defaults = HOMEPAGE_CATEGORY_CARDS
      .filter((fallback) => !storedSlugs.has(fallback.slug))
      .map((fallback) => mapStoredCategory(null, fallback));

    return [...defaults, ...storedCategories];
  } catch {
    return HOMEPAGE_CATEGORY_CARDS;
  }
}

export async function getCategoryBySlug(slug) {
  const categories = await getHomepageCategoryCards();
  return categories.find((category) => category.slug === String(slug ?? "").trim().toLowerCase()) ?? null;
}