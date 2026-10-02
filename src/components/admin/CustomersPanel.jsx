"use client";

import { useMemo, useState } from "react";
import { BadgeInfo, Phone, Search, Star, Users } from "lucide-react";

function toAmount(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatCurrency(value) {
  return `৳${Math.round(toAmount(value)).toLocaleString("en-BD")}`;
}

function getCustomerKey(customer, fallbackIndex) {
  const phone = String(customer?.phone ?? "").trim();
  const name = String(customer?.name ?? "").trim();
  const address = String(customer?.address ?? "").trim();

  if (phone) {
    return phone;
  }

  if (name) {
    return `${name}|${address || fallbackIndex}`;
  }

  return `customer-${fallbackIndex}`;
}

function formatOrderDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

export default function CustomersPanel({ initialOrders = [] }) {
  const [query, setQuery] = useState("");

  const customers = useMemo(() => {
    const orders = Array.isArray(initialOrders) ? initialOrders : [];
    const customerMap = new Map();

    orders.forEach((order, index) => {
      const customer = order.customer ?? {};
      const key = getCustomerKey(customer, index);
      const status = String(order.status ?? "").toLowerCase();
      const isDelivered = status === "delivered";
      const existing = customerMap.get(key) ?? {
        key,
        name: String(customer.name ?? "").trim() || "Unknown customer",
        phone: String(customer.phone ?? "").trim(),
        address: String(customer.address ?? "").trim(),
        city: String(customer.city ?? "").trim(),
        postalCode: String(customer.postalCode ?? "").trim(),
        totalOrders: 0,
        deliveredOrders: 0,
        totalSpent: 0,
        lastOrderAt: null,
      };

      const createdAt = order.createdAt ?? null;
      const lastOrderAt = existing.lastOrderAt;

      customerMap.set(key, {
        ...existing,
        totalOrders: existing.totalOrders + 1,
        deliveredOrders: existing.deliveredOrders + (isDelivered ? 1 : 0),
        totalSpent: existing.totalSpent + (isDelivered ? toAmount(order.total) : 0),
        lastOrderAt: !lastOrderAt || new Date(createdAt) > new Date(lastOrderAt) ? createdAt : lastOrderAt,
      });
    });

    return Array.from(customerMap.values()).sort(
      (left, right) => right.totalSpent - left.totalSpent || right.deliveredOrders - left.deliveredOrders || right.totalOrders - left.totalOrders || left.name.localeCompare(right.name),
    );
  }, [initialOrders]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return customers;
    }

    return customers.filter((customer) => {
      return [customer.name, customer.phone, customer.address, customer.city, customer.postalCode]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [customers, query]);

  const importantCustomer = customers[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border-color bg-muted p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Customers</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">Customer directory</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep customer contact details for future follow-up and find your most valuable customers by delivered spending.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total customers</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{customers.length}</p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Unique customers recorded from order history.</p>
        </div>

        <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Repeat customers</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{customers.filter((customer) => customer.totalOrders > 1).length}</p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
              <BadgeInfo className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Customers with more than one order.</p>
        </div>

        <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Most important</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{importantCustomer?.name ?? "No customer"}</p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {importantCustomer ? `Delivered spend: ${formatCurrency(importantCustomer.totalSpent)}` : "No customer data yet."}
          </p>
        </div>

        <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Delivered spend</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{formatCurrency(customers.reduce((sum, customer) => sum + customer.totalSpent, 0))}</p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
              <Phone className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Total delivered revenue from all customers.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Search</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Find customers</h3>
          </div>

          <div className="w-full sm:max-w-md">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, phone, city or address"
                className="w-full rounded-2xl border border-border-color bg-muted py-3 pl-10 pr-4 text-sm text-foreground outline-none ring-0 placeholder:text-neutral-400"
              />
            </label>
          </div>
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-3xl border border-border-color">
            <div className="divide-y divide-neutral-200">
              {filteredCustomers.map((customer) => (
                <div key={customer.key} className="grid gap-4 px-4 py-4 sm:grid-cols-[1.4fr_0.9fr_0.9fr] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{customer.name}</p>
                      {customer.totalOrders > 1 ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                          Repeat
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Last order: {formatOrderDate(customer.lastOrderAt)}</p>
                  </div>

                  <div className="text-sm text-foreground">
                    <p className="font-medium text-foreground">{customer.phone || "No phone"}</p>
                    <p className="mt-1">{customer.city || "No city"}</p>
                  </div>

                  <div className="text-sm text-foreground sm:text-right">
                    <p className="font-medium text-foreground">{formatCurrency(customer.totalSpent)}</p>
                    <p className="mt-1 text-muted-foreground">{customer.deliveredOrders} delivered / {customer.totalOrders} total</p>
                  </div>

                  {customer.address ? (
                    <div className="sm:col-span-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Address</p>
                      <p className="mt-1 text-sm text-foreground">{customer.address}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
            No customers match your search.
          </div>
        )}
      </div>
    </div>
  );
}