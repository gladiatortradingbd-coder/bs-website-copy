import clientPromise from "@/lib/mongodb";
import { DEFAULT_HERO_IMAGE } from "@/data/hero";

export async function getHeroImages() {
  try {
    const client = await clientPromise;
    const record = await client.db().collection("hero_images").findOne({ key: "homepage" });
    const images = Array.isArray(record?.images)
      ? record.images.filter((image) => typeof image === "string" && image.trim())
      : [];

    return images.length ? images : [DEFAULT_HERO_IMAGE];
  } catch {
    return [DEFAULT_HERO_IMAGE];
  }
}
