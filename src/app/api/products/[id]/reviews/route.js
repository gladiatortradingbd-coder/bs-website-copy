import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function resolveProductId(params) {
  const id = String(params?.id ?? "").trim();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  return id;
}

function mapReview(review) {
  return {
    id: String(review._id),
    name: review.name ?? "Guest",
    rating: Number(review.rating) || 0,
    comment: review.comment ?? "",
    images: Array.isArray(review.images) ? review.images : [],
    createdAt: review.createdAt ?? null,
  };
}

async function recalculateSummary(db, productId) {
  const aggregation = await db.collection("productReviews").aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: "$productId",
        reviewCount: { $sum: 1 },
        ratingAverage: { $avg: "$rating" },
      },
    },
  ]).toArray();

  const summary = aggregation[0] ?? { reviewCount: 0, ratingAverage: 0 };

  await db.collection("products").updateOne(
    { _id: new ObjectId(productId) },
    {
      $set: {
        reviewCount: summary.reviewCount,
        ratingAverage: summary.ratingAverage ?? 0,
        updatedAt: new Date(),
      },
    },
  );

  return {
    count: summary.reviewCount ?? 0,
    average: summary.ratingAverage ?? 0,
  };
}

export async function GET(_request, { params }) {
  const productId = resolveProductId(await params);

  if (!productId) {
    return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const reviews = await db
    .collection("productReviews")
    .find({ productId })
    .sort({ createdAt: -1 })
    .toArray();

  const summaryAggregation = await db.collection("productReviews").aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: "$productId",
        reviewCount: { $sum: 1 },
        ratingAverage: { $avg: "$rating" },
      },
    },
  ]).toArray();

  const summary = summaryAggregation[0] ?? { reviewCount: 0, ratingAverage: 0 };

  return NextResponse.json({
    reviews: reviews.map(mapReview),
    summary: {
      count: summary.reviewCount ?? 0,
      average: summary.ratingAverage ?? 0,
    },
  });
}

export async function POST(request, { params }) {
  try {
    const productId = resolveProductId(await params);

    if (!productId) {
      return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim() || "Guest";
    const comment = String(formData.get("comment") ?? "").trim();
    const rating = Number(String(formData.get("rating") ?? "").trim());
    const images = formData.getAll("images").filter((value) => typeof value === "string").slice(0, 4);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Please choose a rating between 1 and 5." }, { status: 400 });
    }

    if (!comment && !images.length) {
      return NextResponse.json({ message: "Please add a comment or at least one image." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const review = {
      productId,
      name,
      rating,
      comment,
      images,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("productReviews").insertOne(review);
    const summary = await recalculateSummary(db, productId);

    return NextResponse.json({
      message: "Review posted successfully.",
      review: mapReview({ ...review, _id: result.insertedId }),
      summary,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not submit review." },
      { status: 500 },
    );
  }
}