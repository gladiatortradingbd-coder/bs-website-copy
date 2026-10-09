import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { deletePhotoFromCloudinary, uploadPhotoToCloudinary } from "@/lib/cloudinary";
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
    updatedAt: product.updatedAt ?? null,
  };
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

function getPhotos(formData) {
  return formData.getAll("photos").filter((value) => typeof value === "string");
}

function getColors(formData) {
  return String(formData.get("colors") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const productId = String(resolvedParams?.id ?? "").trim();

  if (!ObjectId.isValid(productId)) {
    return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
  }

  const client = await clientPromise;
  const product = await client
    .db()
    .collection("products")
    .findOne({ _id: new ObjectId(productId) });

  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product: mapProduct(product) });
}

export async function PATCH(request, { params }) {
  try {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const resolvedParams = await params;
    const productId = String(resolvedParams?.id ?? "").trim();

    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const price = Number(String(formData.get("price") ?? "").trim());
    const description = String(formData.get("description") ?? "").trim();
    const colors = getColors(formData);
    const stockRaw = String(formData.get("stock") ?? "").trim();
    const stock = stockRaw === "" ? null : Number(stockRaw);
    const bestSelling = String(formData.get("bestSelling") ?? "false") === "true";
    const newArrival = String(formData.get("newArrival") ?? "false") === "true";
    const photos = getPhotos(formData);
    const weightRaw = String(formData.get("weight") ?? "").trim();
    const weight = weightRaw === "" ? null : Number(weightRaw);

    if (!title || !category || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ message: "Product title, category, and price are required." }, { status: 400 });
    }

    if (stockRaw !== "" && (!Number.isInteger(stock) || stock < 0)) {
      return NextResponse.json({ message: "Stock must be a whole number greater than or equal to 0." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("products");
    const existingProduct = await collection.findOne({ _id: new ObjectId(productId) });

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const existingPhotos = Array.isArray(existingProduct.photos) ? existingProduct.photos.filter(Boolean) : [];

    if (!photos.length) {
      return NextResponse.json({ message: "Please add at least one product photo." }, { status: 400 });
    }

    const nextPhotos = await Promise.all(photos.map((photo) => uploadPhotoToCloudinary(photo)));

    if (!nextPhotos.length) {
      return NextResponse.json({ message: "Please add at least one product photo." }, { status: 400 });
    }

    const removedPhotos = existingPhotos.filter((photo) => !nextPhotos.includes(photo));

    const updatedProduct = {
      title,
      category,
      price,
      description,
      colors,
      stock,
      weight,
      photos: nextPhotos,
      bestSelling,
      newArrival,
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: updatedProduct },
    );

    void Promise.allSettled(removedPhotos.map((photo) => deletePhotoFromCloudinary(photo)));

    return NextResponse.json({
      message: "Product updated successfully.",
      product: mapProduct({ ...existingProduct, ...updatedProduct, _id: existingProduct._id }),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const guard = await requireAdmin();

    if (guard.error) {
      return guard.error;
    }

    const resolvedParams = await params;
    const productId = String(resolvedParams?.id ?? "").trim();

    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
    }

    const client = await clientPromise;
    const collection = client.db().collection("products");
    const existingProduct = await collection.findOne({ _id: new ObjectId(productId) });

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(productId) });

    if (!result.deletedCount) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const photos = Array.isArray(existingProduct.photos) ? existingProduct.photos.filter(Boolean) : [];
    await Promise.allSettled(photos.map((photo) => deletePhotoFromCloudinary(photo)));

    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete product." },
      { status: 500 },
    );
  }
}