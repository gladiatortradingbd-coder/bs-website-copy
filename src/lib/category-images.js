import clientPromise from "@/lib/mongodb";
import { createCategorySlug, HOMEPAGE_CATEGORY_CARDS } from "@/lib/categories";

export function getDeletedCategorySlugs(records) {
  return new Set(
    records
      .filter((record) => record.deleted)
      .flatMap((record) => [record.slug, record.legacySlug, record.title])
      .map((value) => createCategorySlug(value))
      .filter(Boolean),
  );
}

function mapStoredCategory(category, fallback) {
  const storedTitle = String(category?.title ?? "").trim();
  const title = storedTitle || fallback.title;

  return {
    slug: storedTitle ? createCategorySlug(title) : fallback.slug,
    title,
    href: `/shop?category=${encodeURIComponent(storedTitle ? createCategorySlug(title) : fallback.slug)}`,
    image: category?.image || fallback.image,
    updatedAt: category?.updatedAt ?? null,
  };
}

export async function getHomepageCategoryCards() {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("category_images");
    const records = await collection.find({}).toArray();
    const deletedCategorySlugs = getDeletedCategorySlugs(records);
    const bySlug = new Map();

    records.forEach((record) => {
      if (record.deleted) {
        return;
      }

      const slug = String(record.slug ?? "").trim();
      const legacySlug = String(record.legacySlug ?? "").trim();

      if (slug) {
        bySlug.set(slug, record);
      }

      if (legacySlug) {
        bySlug.set(legacySlug, record);
      }
    });

    const storedCategories = records
      .filter((record) => !record.deleted)
      .map((record) => {
        const slug = String(record.slug ?? "").trim();
        const legacySlug = String(record.legacySlug ?? "").trim();
        const fallback = HOMEPAGE_CATEGORY_CARDS.find((item) => item.slug === slug || item.slug === legacySlug);

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
      .filter((category) => !deletedCategorySlugs.has(createCategorySlug(category.slug)))
      .filter((category) => !records.some((record) => String(record.legacySlug ?? "").trim() === category.slug))
      .filter((category) => category.slug && category.title && category.image);

    const storedSlugs = new Set(storedCategories.map((category) => category.slug));
    const defaults = HOMEPAGE_CATEGORY_CARDS
      .filter((fallback) => !storedSlugs.has(fallback.slug) && !deletedCategorySlugs.has(fallback.slug))
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