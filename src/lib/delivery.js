/**
 * Delivery charge rules:
 *
 * Base:
 *   - Inside Dhaka:  ৳80
 *   - Outside Dhaka: ৳150
 *
 * Media category weight surcharge:
 *   - Sum the weights of all Media products in the cart first.
 *   - Floor the sum (e.g. 1.99 kg becomes 1 kg).
 *   - Surcharge is total floored weight multiplied by ৳20.
 */

export const DELIVERY_RATES = {
  insideDhaka: 80,
  outsideDhaka: 150,
};

export const MEDIA_WEIGHT_RATE = 20; // ৳ per extra whole kg

/** Returns true when the customer's region is inside Dhaka. */
export function isInsideDhaka(region) {
  return String(region ?? "").trim().toLowerCase() === "dhaka";
}

/**
 * Calculates the weight surcharge for a single Media product unit.
 *
 * @param {number} weightKg  - weight of one unit in kg
 * @returns {number}          - surcharge in Tk for one unit
 */
export function weightSurchargePerUnit(weightKg) {
  const w = Number(weightKg);
  if (!Number.isFinite(w) || w <= 0) return 0;
  return Math.floor(w) * MEDIA_WEIGHT_RATE;
}

/**
 * Calculates the full delivery charge breakdown.
 *
 * @param {string} region       - customer's selected region
 * @param {Array}  cartItems    - array of cart items: { id, quantity, category?, weight? }
 * @returns {{ base: number, weightSurcharge: number, total: number }}
 */
export function calculateDeliveryCharge(region, cartItems) {
  const base = isInsideDhaka(region)
    ? DELIVERY_RATES.insideDhaka
    : DELIVERY_RATES.outsideDhaka;

  let totalMediaWeight = 0;

  for (const item of cartItems ?? []) {
    const category = String(item.category ?? "").trim().toLowerCase();
    const isMedia = ["media", "media (soil)", "soil"].includes(category);

    if (!isMedia) continue;

    const qty = Math.max(1, Number(item.quantity) || 1);
    const weight = Number(item.weight);
    if (Number.isFinite(weight) && weight > 0) {
      totalMediaWeight += weight * qty;
    }
  }

  const roundedWeight = Math.floor(totalMediaWeight);
  const weightSurcharge = roundedWeight * MEDIA_WEIGHT_RATE;

  return {
    base,
    weightSurcharge,
    total: base + weightSurcharge,
  };
}
