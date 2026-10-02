import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/auth";
import clientPromise from "@/lib/mongodb";

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

export async function PATCH(request, { params }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const resolvedParams = await params;
    const id = String(resolvedParams?.id ?? "").trim();

    if (!id) return NextResponse.json({ message: "Missing order id" }, { status: 400 });

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    const ALLOWED = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !ALLOWED.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const collection = db.collection("orders");
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const o = await collection.findOne({ _id: new ObjectId(id) });

    if (!o) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: {
      id: String(o._id),
      items: o.items,
      total: o.total,
      paymentMethod: o.paymentMethod,
      status: o.status,
      customer: o.customer,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    } });
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Could not update order" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const resolvedParams = await params;
    const id = String(resolvedParams?.id ?? "").trim();

    if (!id) return NextResponse.json({ message: "Missing order id" }, { status: 400 });

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) });

    if (!result.deletedCount) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Could not delete order" }, { status: 500 });
  }
}
