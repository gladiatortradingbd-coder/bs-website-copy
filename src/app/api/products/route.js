import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { getCategoryBySlug } from "@/lib/category-images";
import { getCategoryFilterValues } from "@/lib/categories";
import { uploadPhotoToCloudinary } from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";

function mapProduct(product) {
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

function parsePriceFilter(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function requireAdmin() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  if (session.user.role !== "admin") {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { session };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = String(searchParams.get("search") ?? searchParams.get("q") ?? "").trim();
  const category = String(searchParams.get("category") ?? "").trim();
  const newArrivalOnly = ["1", "true"].includes(String(searchParams.get("newArrival") ?? "").trim().toLowerCase());
  const maxPrice = parsePriceFilter(searchParams.get("maxPrice"));
  const requestedLimit = Number(searchParams.get("limit") ?? 15);
  const limit = Math.min(Math.max(requestedLimit || 15, 1), 20);
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page = Math.max(requestedPage || 1, 1);
  const categoriesOnly = searchParams.get("categories") === "1";

  const client = await clientPromise;
  const collection = client.db().collection("products");

  if (categoriesOnly) {
    const categories = await collection.distinct("category", { category: { $type: "string", $ne: "" } });

    return NextResponse.json({
      categories: categories.filter(Boolean).map((value) => String(value).trim()).filter(Boolean).sort((left, right) => left.localeCompare(right)),
    });
  }

  const andClauses = [];

  const dynamicCategory = category ? await getCategoryBySlug(category) : null;
  const categoryValues = dynamicCategory ? [dynamicCategory.title] : getCategoryFilterValues(category);

  if (categoryValues.length > 0) {
    andClauses.push({
      $or: categoryValues.map((value) => ({
      category: { $regex: `^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      })),
    });
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchClauses = [
      { title: { $regex: escapedSearch, $options: "i" } },
      { category: { $regex: escapedSearch, $options: "i" } },
    ];

    andClauses.push({ $or: searchClauses });
  }

  if (maxPrice !== null) {
    const priceClause = {};

    priceClause.$gte = 0;

    priceClause.$lte = maxPrice;

    andClauses.push({ price: priceClause });
  }

  if (newArrivalOnly) {
    andClauses.push({ newArrival: true });
  }

  let query = {};

  if (andClauses.length === 1) {
    [query] = andClauses;
  } else if (andClauses.length > 1) {
    query = { $and: andClauses };
  }

  const projection = {
    title: 1, category: 1, price: 1, photos: 1, description: 1, colors: 1,
    stock: 1, weight: 1, bestSelling: 1, newArrival: 1, reviewCount: 1, ratingAverage: 1, createdAt: 1
  };

  const total = await collection.countDocuments(query);
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  const safePage = Math.min(page, totalPages);

  const products = await collection
    .find(query, { projection })
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * limit)
    .limit(limit)
    .toArray();

  return NextResponse.json({
    products: products.map(mapProduct),
    total,
    page: safePage,
    pageSize: limit,
    totalPages,
  });
}

export async function POST(request) {
  try {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const price = Number(String(formData.get("price") ?? "").trim());
    const description = String(formData.get("description") ?? "").trim();
    const colors = String(formData.get("colors") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 10);
    const stockRaw = String(formData.get("stock") ?? "").trim();
    const bestSelling = String(formData.get("bestSelling") ?? "false") === "true";
    const newArrival = String(formData.get("newArrival") ?? "false") === "true";
    const photos = formData.getAll("photos").filter((value) => typeof value === "string");
    const stock = stockRaw === "" ? null : Number(stockRaw);
    const weightRaw = String(formData.get("weight") ?? "").trim();
    const weight = weightRaw === "" ? null : Number(weightRaw);

    if (!title || !category || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ message: "Product title, category, and price are required." }, { status: 400 });
    }

    if (stockRaw !== "" && (!Number.isInteger(stock) || stock < 0)) {
      return NextResponse.json({ message: "Stock must be a whole number greater than or equal to 0." }, { status: 400 });
    }

    if (!photos.length) {
      return NextResponse.json({ message: "Please add at least one product photo." }, { status: 400 });
    }

    const uploadedPhotos = await Promise.all(photos.map((photo) => uploadPhotoToCloudinary(photo)));

    const client = await clientPromise;
    const db = client.db();
    const product = {
      title,
      category,
      price,
      description,
      colors,
      stock,
      weight,
      photos: uploadedPhotos,
      bestSelling,
      newArrival,
      reviewCount: 0,
      ratingAverage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(guard.session.user.id),
    };

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json({
      message: "Product created successfully.",
      product: mapProduct({ ...product, _id: result.insertedId }),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not create product." },
      { status: 500 },
    );
  }
}