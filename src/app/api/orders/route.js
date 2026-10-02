import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import { calculateDeliveryCharge } from "@/lib/delivery";
import clientPromise from "@/lib/mongodb";
import { getRedis } from "@/lib/upstash";

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

function validateOrderPayload(body) {
  if (!body) return "Missing body";
  const { items, customer, paymentMethod } = body;

  if (!Array.isArray(items) || items.length === 0) return "Items are required";
  if (!customer || !customer.name || !customer.phone || !customer.region || !customer.address) return "Customer name, phone, region and address are required";
  if (paymentMethod !== "COD") return "Only COD (cash on delivery) is supported";

  for (const it of items) {
    if (!it.id || !Number.isFinite(it.quantity) || it.quantity <= 0) return "Invalid item format";
  }

  return null;
}

export async function GET(request) {
  const guard = await requireAdmin();

  if (guard.error) return guard.error;

  const client = await clientPromise;
  const orders = await client.db().collection("orders").find({}).sort({ createdAt: -1 }).toArray();

  return NextResponse.json({ orders: orders.map((o) => ({
    id: String(o._id),
    items: o.items,
    subtotal: o.subtotal ?? o.total,
    deliveryCharge: o.deliveryCharge ?? null,
    total: o.total,
    paymentMethod: o.paymentMethod,
    status: o.status,
    customer: o.customer,
    createdAt: o.createdAt,
  })) });
}

export async function POST(request) {
  try {
    const RATE_LIMIT_WINDOW_SEC = 60 * 60; // 1 hour
    const RATE_LIMIT_MAX = 30; // max orders per window per IP

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    const redisClient = await getRedis();

    if (redisClient) {
      try {
        const key = `orders:rate:${ip}`;
        const count = await redisClient.incr(key);
        if (count === 1) {
          await redisClient.expire(key, RATE_LIMIT_WINDOW_SEC);
        }
        if (count > RATE_LIMIT_MAX) {
          return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 });
        }
      } catch (e) {
        // If redis fails, fall back to in-memory limiter below
      }
    }

    // Fallback in-memory limiter for development or if Upstash isn't configured
    const globalStore = globalThis.__orderRateLimit ||= { map: new Map() };
    const now = Date.now();
    const entry = globalStore.map.get(ip) || [];
    const recent = entry.filter((ts) => now - ts < RATE_LIMIT_WINDOW_SEC * 1000);

    if (recent.length >= RATE_LIMIT_MAX) {
      return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 });
    }

    recent.push(now);
    globalStore.map.set(ip, recent);

    const body = await request.json();

    const err = validateOrderPayload(body);

    if (err) {
      return NextResponse.json({ message: err }, { status: 400 });
    }

    const idempotencyKey = request.headers.get("idempotency-key") || null;

    const client = await clientPromise;
    const db = client.db();

    if (idempotencyKey) {
      const existing = await db.collection("orders").findOne({ idempotencyKey });
      if (existing) {
        return NextResponse.json({ message: "Order already exists", orderId: String(existing._id) });
      }
    }

    // Recalculate totals from product DB to avoid trusting client prices
    const productIds = body.items.map((i) => new ObjectId(String(i.id)));
    const products = await db.collection("products").find({ _id: { $in: productIds } }).toArray();

    const productsById = new Map(products.map((p) => [String(p._id), p]));

    let total = 0;
    const items = [];

    for (const it of body.items) {
      const pid = String(it.id);
      const product = productsById.get(pid);
      if (!product) {
        return NextResponse.json({ message: `Product not found: ${pid}` }, { status: 400 });
      }

      const qty = Number(it.quantity);
      const currentStock = typeof product.stock === "number" && Number.isFinite(product.stock) ? product.stock : null;

      if (currentStock !== null && currentStock < qty) {
        return NextResponse.json({ message: `Not enough stock for ${product.title ?? pid}` }, { status: 400 });
      }

      const lineTotal = (Number(product.price) || 0) * qty;
      total += lineTotal;

      items.push({
        productId: pid,
        title: product.title ?? "",
        price: Number(product.price) || 0,
        quantity: qty,
        category: product.category ?? "",
        weight: product.weight ?? null,
        selectedColor: String(it.selectedColor ?? "").trim() || null,
        lineTotal,
      });
    }

    // Compute delivery charge from region + product weights
    const deliveryCartItems = items.map((it) => ({
      category: it.category,
      weight: it.weight,
      quantity: it.quantity,
    }));
    const deliveryCharge = calculateDeliveryCharge(
      body.customer.region,
      deliveryCartItems,
    );

    const subtotal = total;
    total = subtotal + deliveryCharge.total;

    const order = {
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: "COD",
      status: "pending",
      customer: {
        name: String(body.customer.name).trim(),
        phone: String(body.customer.phone).trim(),
        region: String(body.customer.region ?? "").trim(),
        address: String(body.customer.address).trim(),
        city: String(body.customer.city ?? "").trim(),
        postalCode: String(body.customer.postalCode ?? "").trim(),
      },
      idempotencyKey: idempotencyKey ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    const stockUpdates = body.items.map((it) => ({
      id: String(it.id),
      quantity: Number(it.quantity),
    }));

    await Promise.all(stockUpdates.map(async ({ id, quantity }) => {
      const product = productsById.get(id);

      if (!product || !(typeof product.stock === "number" && Number.isFinite(product.stock))) {
        return;
      }

      await db.collection("products").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { stock: -quantity }, $set: { updatedAt: new Date() } },
      );
    }));

    return NextResponse.json({ message: "Order created", orderId: String(result.insertedId) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not create order" }, { status: 500 });
  }
}
