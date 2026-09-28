import type { DemoData } from "./demo";

export function formatImportedSar(value: number): string {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function latestImportedDay(data: DemoData): string | null {
  return data.orderImports.reduce<string | null>(
    (latest, batch) => (!latest || batch.last_order_day > latest ? batch.last_order_day : latest),
    null,
  );
}

export function importedRange(data: DemoData, days: number) {
  const latest = latestImportedDay(data);
  if (!latest) return [];
  const last = Date.parse(latest + "T00:00:00Z");
  const first = new Date(last - (days - 1) * 86400000).toISOString().slice(0, 10);
  return data.orderPerformance.filter((row) => row.day >= first && row.day <= latest);
}

export function importAgeDays(latest: string): number {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
  return Math.max(
    0,
    Math.floor((Date.parse(today + "T00:00:00Z") - Date.parse(latest + "T00:00:00Z")) / 86400000),
  );
}

export function sumImported(
  rows: DemoData["orderPerformance"],
  field:
    | "delivered_orders"
    | "cancelled_orders"
    | "complaint_orders"
    | "gross_sales_sar"
    | "reported_payout_sar"
    | "estimated_earnings_sar"
    | "vendor_discount_sar"
    | "commission_sar"
    | "online_payment_fee_sar"
    | "operational_charges_sar"
    | "ads_fee_sar"
    | "delivery_minutes_sum"
    | "delivery_minutes_count",
): number {
  return rows.reduce((total, row) => total + Number(row[field]), 0);
}
