import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 3600;

// Pre-render a subset of product pages at build time (latest 100) to improve performance.
export async function generateStaticParams() {
  try {
    const client = await clientPromise;
    const products = await client
      .db()
      .collection("products")
      .find({}, { projection: { _id: 1 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return products.map((p) => ({ id: String(p._id) }));
  } catch (err) {
    return [];
  }
}

async function loadProduct(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const client = await clientPromise;
  const product = await client
    .db()
    .collection("products")
    .findOne({ _id: new ObjectId(id) });

  if (!product) {
    return null;
  }

  const stockValue = Number(product.stock);
  const weightValue = Number(product.weight);

  return {
    id: String(product._id),
    title: product.title ?? "",
    category: product.category ?? "",
    price: product.price ?? "",
    photos: Array.isArray(product.photos) ? product.photos : [],
    description: product.description ?? "",
    colors: Array.isArray(product.colors) ? product.colors : [],
    stock: Number.isFinite(stockValue) ? stockValue : null,
    weight: Number.isFinite(weightValue) && weightValue > 0 ? weightValue : null,
    bestSelling: Boolean(product.bestSelling),
    newArrival: Boolean(product.newArrival),
    reviewCount: Number.isFinite(Number(product.reviewCount)) ? Number(product.reviewCount) : 0,
    ratingAverage: Number.isFinite(Number(product.ratingAverage)) ? Number(product.ratingAverage) : 0,
    createdAt: product.createdAt ?? null,
  };
}

async function loadReviews(productId) {
  const client = await clientPromise;
  const reviews = await client
    .db()
    .collection("productReviews")
    .find({ productId })
    .sort({ createdAt: -1 })
    .toArray();

  return reviews.map((review) => ({
    id: String(review._id),
    name: review.name ?? "Guest",
    rating: Number(review.rating) || 0,
    comment: review.comment ?? "",
    images: Array.isArray(review.images) ? review.images : [],
    createdAt: review.createdAt ?? null,
  }));
}

function mapProductSummary(product) {
  return {
    id: String(product._id),
    title: product.title ?? "",
    category: product.category ?? "",
    price: product.price ?? "",
    photos: Array.isArray(product.photos) ? product.photos : [],
    bestSelling: Boolean(product.bestSelling),
    newArrival: Boolean(product.newArrival),
  };
}

async function loadProductCollections(product) {
  const client = await clientPromise;
  const collection = client.db().collection("products");
  const currentObjectId = new ObjectId(product.id);

  const projection = { title: 1, category: 1, price: 1, photos: 1, bestSelling: 1, newArrival: 1 };

  const [similarProducts, youMayAlsoLike] = await Promise.all([
    collection
      .find({ _id: { $ne: currentObjectId }, category: product.category }, { projection })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray(),
    collection
      .find({ _id: { $ne: currentObjectId }, $or: [{ newArrival: true }, { bestSelling: true }] }, { projection })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray(),
  ]);

  const similarFallback = similarProducts.length > 0
    ? similarProducts
    : await collection
        .find({ _id: { $ne: currentObjectId } }, { projection })
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray();

  const recommendedFallback = youMayAlsoLike.length > 0
    ? youMayAlsoLike
    : await collection
        .find({ _id: { $ne: currentObjectId }, category: { $ne: product.category } }, { projection })
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray();

  return {
    similarProducts: similarFallback.map(mapProductSummary),
    recommendedProducts: recommendedFallback.map(mapProductSummary),
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const productId = String(resolvedParams?.id ?? "").trim();
  const product = await loadProduct(productId);

  if (!product) {
    notFound();
  }

  const [reviews, productCollections] = await Promise.all([
    loadReviews(product.id),
    loadProductCollections(product),
  ]);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <ProductDetailClient
          product={product}
          initialReviews={reviews}
          similarProducts={productCollections.similarProducts}
          recommendedProducts={productCollections.recommendedProducts}
        />
      </div>
    </main>
  );
}