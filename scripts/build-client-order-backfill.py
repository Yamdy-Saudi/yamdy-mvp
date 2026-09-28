"""Validate the nine local HungerStation exports and generate an aggregate-only migration.

Raw order values are read in memory. The generated SQL contains daily totals and
source digests, never order IDs, addresses, or item descriptions.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import re
import sys
import zipfile
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from xml.etree import ElementTree as ET

NAMESPACE = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
FILES = [
    "orderDetails(1).xlsx",
    "orderDetails(2).xlsx",
    "orderDetails(3).xlsx",
    "orderDetails(4).xlsx",
    "orderDetails(5).xlsx",
    "orderDetails(6).xlsx",
    "orderDetails(2).csv",
    "orderDetails(3).csv",
    "orderDetails(4).csv",
]
REQUIRED = {
    "Restaurant name", "Order ID", "Store ID", "Order status",
    "Order received at", "Delivered at", "Cancelled at", "Has Complaint?",
    "Subtotal", "Payout Amount", "Estimated earnings",
    "Discount Funded by you", "Commission", "Online Payment Fee",
    "Operational Charges", "Ads Fee",
}
MONEY = {
    "Subtotal": "gross_sales_sar",
    "Payout Amount": "reported_payout_sar",
    "Estimated earnings": "estimated_earnings_sar",
    "Discount Funded by you": "vendor_discount_sar",
    "Commission": "commission_sar",
    "Online Payment Fee": "online_payment_fee_sar",
    "Operational Charges": "operational_charges_sar",
    "Ads Fee": "ads_fee_sar",
}
EXPECTED = {
    "orders": 582,
    "delivered": 577,
    "cancelled": 5,
    "gross_sales_sar": Decimal("62296.00"),
    "reported_payout_sar": Decimal("27437.84"),
}
EXPECTED_RESTAURANT = "Aclo - Al Muruj"
EXPECTED_STORE_SHA256 = "8e591bac030e9fd7d89f0eded01a3bf2ba651d69b32eebfd913cde9ae8c36589"
TARGET_WORKSPACE_NAME = "Aclo"
TARGET_WORKSPACE_CREATED_AT = "2026-09-27 17:10:08.516764+00"
OTHER_FINANCIAL_FIELDS = [
    "Packaging charges", "Minimum order value fee", "Vendor Refunds",
    "Customer Fee Total", "Tax Charge", "Voucher Funded by you",
    "Wait time fee", "Marketing Fees Total", "Marketing Fees",
    "Avoidable cancellation fee", "Cash amount already collected by you",
    "Amount owed back to Hungerstation", "Hungerstation-Funded Discount",
    "Hungerstation-Funded Voucher", "Total Discount", "Total Voucher",
    "Tax Amount",
]


def column_index(ref: str) -> int:
    letters = re.match(r"[A-Z]+", ref)
    if not letters:
        raise ValueError(f"Invalid spreadsheet cell reference: {ref}")
    index = 0
    for letter in letters.group():
        index = index * 26 + ord(letter) - ord("A") + 1
    return index - 1


def excel_rows(path: Path) -> list[dict[str, str]]:
    # These exports have invalid style XML. Read OOXML values directly, ignoring styles.
    with zipfile.ZipFile(path) as archive:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = [
                "".join(node.text or "" for node in item.findall(".//m:t", NAMESPACE))
                for item in root.findall("m:si", NAMESPACE)
            ]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        values: list[list[str]] = []
        for row in sheet.findall(".//m:sheetData/m:row", NAMESPACE):
            cells = [""] * 50
            for cell in row.findall("m:c", NAMESPACE):
                index = column_index(cell.attrib["r"])
                if index >= len(cells):
                    raise ValueError(f"Unexpected extra column in {path.name}")
                value = cell.find("m:v", NAMESPACE)
                inline = cell.find("m:is", NAMESPACE)
                text = (
                    value.text or ""
                    if value is not None
                    else "".join(n.text or "" for n in inline.findall(".//m:t", NAMESPACE))
                    if inline is not None
                    else ""
                )
                if cell.get("t") == "s":
                    text = shared[int(text)]
                cells[index] = text
            values.append(cells)
    if len(values) < 3 or values[0][0] != "Order Metadata":
        raise ValueError(f"Unexpected workbook layout in {path.name}")
    headers = values[1]
    return [dict(zip(headers, row)) for row in values[2:]]


def source_rows(path: Path) -> list[dict[str, str]]:
    if path.suffix == ".xlsx":
        return excel_rows(path)
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def money(value: str, field: str, source: str) -> Decimal:
    try:
        result = Decimal(value.strip())
    except (InvalidOperation, AttributeError):
        raise ValueError(f"Invalid {field} in {source}") from None
    if not result.is_finite() or result.as_tuple().exponent < -2:
        raise ValueError(f"Invalid precision for {field} in {source}")
    if field not in {"Estimated earnings", "Payout Amount"} and result < 0:
        raise ValueError(f"Negative {field} in {source}")
    return result


def date_time(value: str, field: str, source: str) -> datetime:
    try:
        return datetime.strptime(value.strip(), "%Y-%m-%d %H:%M")
    except ValueError:
        raise ValueError(f"Invalid {field} in {source}") from None


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def build(source_dir: Path) -> tuple[str, dict[str, object]]:
    rows: list[dict[str, str]] = []
    file_hash = hashlib.sha256()
    for filename in FILES:
        path = source_dir / filename
        if not path.is_file():
            raise ValueError(f"Missing source file: {filename}")
        file_hash.update(filename.encode("utf-8"))
        file_hash.update(hashlib.sha256(path.read_bytes()).digest())
        records = source_rows(path)
        if not records or not REQUIRED.issubset(records[0]):
            raise ValueError(f"Missing required headers in {filename}")
        rows.extend(records)

    identifiers = [row["Order ID"].strip() for row in rows]
    if any(not value for value in identifiers) or len(set(identifiers)) != len(identifiers):
        raise ValueError("Missing or duplicate Order ID across exports")
    stores = {row["Store ID"].strip() for row in rows}
    restaurants = {row["Restaurant name"].strip() for row in rows}
    if len(stores) != 1 or "" in stores or len(restaurants) != 1 or "" in restaurants:
        raise ValueError("Exports do not identify exactly one store and restaurant")
    restaurant = restaurants.pop()
    store_digest = hashlib.sha256(stores.pop().encode("utf-8")).hexdigest()
    if restaurant != EXPECTED_RESTAURANT or store_digest != EXPECTED_STORE_SHA256:
        raise ValueError("Export identity differs from the approved client store")

    fields = list(MONEY.values())
    days: dict[str, dict[str, Decimal | int]] = defaultdict(
        lambda: {
            "delivered_orders": 0, "cancelled_orders": 0, "complaint_orders": 0,
            **{field: Decimal("0") for field in fields},
            "delivery_minutes_sum": Decimal("0"), "delivery_minutes_count": 0,
        }
    )
    for row in rows:
        source = "order-details export"
        received = date_time(row["Order received at"], "Order received at", source)
        if received.date().isoformat() > datetime.now().date().isoformat():
            raise ValueError("An order date is in the future")
        day = days[received.date().isoformat()]
        status = row["Order status"].strip()
        if status not in {"Delivered", "Cancelled"}:
            raise ValueError(f"Unsupported order status: {status}")
        if row["Has Complaint?"].strip() not in {"Y", "N"}:
            raise ValueError("Invalid complaint flag")
        if row["Has Complaint?"].strip() == "Y":
            day["complaint_orders"] += 1
        amounts = {field: money(row[field], field, source) for field in MONEY}
        for field in OTHER_FINANCIAL_FIELDS:
            money(row[field], field, source)
        if status == "Delivered":
            day["delivered_orders"] += 1
            for source_field, target_field in MONEY.items():
                day[target_field] += amounts[source_field]
            delivered = date_time(row["Delivered at"], "Delivered at", source)
            minutes = Decimal(str((delivered - received).total_seconds() / 60))
            if minutes < 0:
                raise ValueError("Delivery precedes order receipt")
            day["delivery_minutes_sum"] += minutes
            day["delivery_minutes_count"] += 1
        else:
            day["cancelled_orders"] += 1
            if date_time(row["Cancelled at"], "Cancelled at", source) < received:
                raise ValueError("Cancellation precedes order receipt")

    totals = {
        "orders": len(rows),
        "delivered": sum(int(day["delivered_orders"]) for day in days.values()),
        "cancelled": sum(int(day["cancelled_orders"]) for day in days.values()),
        "gross_sales_sar": sum((day["gross_sales_sar"] for day in days.values()), Decimal("0")),
        "reported_payout_sar": sum((day["reported_payout_sar"] for day in days.values()), Decimal("0")),
    }
    if totals != EXPECTED:
        raise ValueError(f"Export reconciliation failed: {totals}")

    ordered_days = sorted(days)
    columns = [
        "day", "delivered_orders", "cancelled_orders", "complaint_orders",
        *fields, "delivery_minutes_sum", "delivery_minutes_count",
    ]
    values = []
    for date in ordered_days:
        day = days[date]
        formatted = [
            sql_literal(date) + "::date",
            *(str(day[column]) for column in columns[1:]),
        ]
        values.append("    (" + ", ".join(formatted) + ")")
    column_sql = ", ".join(columns)
    select_sql = ", ".join("d." + column for column in columns)
    sql = f"""-- One-time aggregate backfill. Generated by scripts/build-client-order-backfill.py.
-- 582 order rows are reduced to {len(ordered_days)} observed days; raw orders are not stored.
do $$
declare
  v_workspace uuid;
  v_brand uuid;
  v_branch uuid;
  v_batch uuid;
  v_candidates integer;
begin
  select count(*) into v_candidates
  from public.workspaces w
  where w.name = {sql_literal(TARGET_WORKSPACE_NAME)}
    and w.created_at = {sql_literal(TARGET_WORKSPACE_CREATED_AT)}::timestamptz
    and exists (
    select 1 from public.branches b
    where b.workspace_id = w.id and b.is_demo and b.code in ('demo-olaya', 'demo-nakheel', 'demo-malqa')
  ) and exists (
    select 1 from public.aggregator_connections c
    where c.workspace_id = w.id and c.provider = 'hungerstation' and c.mode = 'mock'
  );
  if v_candidates = 0 and current_setting('app.isolated_test', true) = 'on' then
    return;
  end if;
  if v_candidates <> 1 then
    raise exception 'Expected exactly one eligible current demo workspace, found %', v_candidates;
  end if;
  select w.id into v_workspace from public.workspaces w
  where w.name = {sql_literal(TARGET_WORKSPACE_NAME)}
    and w.created_at = {sql_literal(TARGET_WORKSPACE_CREATED_AT)}::timestamptz
    and exists (
    select 1 from public.branches b
    where b.workspace_id = w.id and b.is_demo and b.code in ('demo-olaya', 'demo-nakheel', 'demo-malqa')
  ) and exists (
    select 1 from public.aggregator_connections c
    where c.workspace_id = w.id and c.provider = 'hungerstation' and c.mode = 'mock'
  );
  if exists (select 1 from public.order_import_batches where workspace_id = v_workspace) then
    raise exception 'Client order data already exists in target workspace';
  end if;
  update public.workspaces set name = {sql_literal(restaurant)},
    reporting_mode = 'client_export', updated_at = now() where id = v_workspace;
  update public.branches set archived_at = now()
    where workspace_id = v_workspace and is_demo and archived_at is null;
  insert into public.brands(workspace_id, name, is_demo)
    values (v_workspace, 'Aclo', false)
    returning id into v_brand;
  insert into public.branches(workspace_id, brand_id, code, name, city, timezone, is_demo)
    values (v_workspace, v_brand, 'client-export-branch', 'Al Muruj', 'Riyadh', 'Asia/Riyadh', false)
    returning id into v_branch;
  insert into public.order_import_batches(
    workspace_id, branch_id, source, source_files_sha256, source_store_sha256,
    source_file_count, source_order_count, first_order_day, last_order_day
  ) values (
    v_workspace, v_branch, 'hungerstation_order_details_export',
    '{file_hash.hexdigest()}', '{store_digest}', {len(FILES)}, {len(rows)},
    '{ordered_days[0]}'::date, '{ordered_days[-1]}'::date
  ) returning id into v_batch;
  insert into public.order_performance_daily(
    workspace_id, branch_id, import_batch_id, {column_sql}
  )
  select v_workspace, v_branch, v_batch, {select_sql}
  from (values
{',\n'.join(values)}
  ) as d({column_sql});
  if (select sum(delivered_orders + cancelled_orders)
      from public.order_performance_daily where import_batch_id = v_batch) <> {len(rows)}
     or (select sum(gross_sales_sar)
      from public.order_performance_daily where import_batch_id = v_batch) <> 62296.00
     or (select sum(reported_payout_sar)
      from public.order_performance_daily where import_batch_id = v_batch) <> 27437.84 then
    raise exception 'Post-insert aggregate reconciliation failed';
  end if;
end $$;
"""
    return sql, {**totals, "days": len(ordered_days), "first": ordered_days[0], "last": ordered_days[-1]}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("migration_path", type=Path)
    args = parser.parse_args()
    sql, summary = build(args.source_dir)
    args.migration_path.write_text(sql, encoding="utf-8")
    print("Validated and generated aggregate-only migration:", summary)


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from None
