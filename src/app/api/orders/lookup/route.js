import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = String(searchParams.get("orderId") ?? "").trim();
    const phone = normalizePhone(searchParams.get("phone"));

    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "Please enter a valid order id." }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ message: "Please enter the phone number used for the order." }, { status: 400 });
    }

    const client = await clientPromise;
    const order = await client.db().collection("orders").findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const orderPhone = normalizePhone(order.customer?.phone);
    if (orderPhone !== phone) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: String(order._id),
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        customer: {
          name: order.customer?.name ?? "",
          phone: order.customer?.phone ?? "",
          address: order.customer?.address ?? "",
        },
        items: Array.isArray(order.items) ? order.items : [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not check order status." }, { status: 500 });
  }
}