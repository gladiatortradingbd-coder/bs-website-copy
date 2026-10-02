import clientPromise from "@/lib/mongodb";
import { HOMEPAGE_CATEGORY_CARDS } from "@/lib/categories";

function mapStoredCategory(category, fallback) {
  return {
    slug: fallback.slug,
    title: fallback.title,
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

    return HOMEPAGE_CATEGORY_CARDS.map((fallback) => mapStoredCategory(bySlug.get(fallback.slug), fallback));
  } catch {
    return HOMEPAGE_CATEGORY_CARDS;
  }
}