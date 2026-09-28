-- Imported reports are read-only through the browser. Backfills use migrations.
revoke all privileges on table public.order_import_batches,
  public.order_performance_daily from public, anon, authenticated;

grant select on table public.order_import_batches,
  public.order_performance_daily to authenticated;
