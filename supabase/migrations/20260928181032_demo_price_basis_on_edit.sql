-- A saved demo price can no longer be described as an observed order subtotal.
create or replace function public.demo_save_product_draft(
  p_product_id uuid, p_name_en text, p_name_ar text,
  p_description_en text, p_price_sar numeric
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_product public.catalog_products%rowtype;
begin
  select * into v_product from public.catalog_products where id=p_product_id for update;
  if not found then raise exception 'Product not found'; end if;
  if not coalesce(private.can_manage(v_product.workspace_id),false) then
    raise exception 'Catalog draft permission required' using errcode='42501';
  end if;
  if not v_product.is_demo or length(trim(p_name_en)) < 2 or p_price_sar < 0 then
    raise exception 'Invalid demo product draft';
  end if;
  update public.catalog_products set
    name_en=trim(p_name_en), name_ar=trim(p_name_ar),
    description_en=trim(p_description_en), price_sar=p_price_sar,
    price_basis=case when p_price_sar is distinct from v_product.price_sar
      then 'illustrative' else v_product.price_basis end,
    updated_at=now()
    where id=p_product_id;
  insert into public.demo_audit_events(workspace_id,actor_user_id,action,entity_kind,entity_id,details)
    values(v_product.workspace_id,auth.uid(),'save_draft','product',p_product_id,
      jsonb_build_object('channel_request_sent',false,
        'price_basis_changed',p_price_sar is distinct from v_product.price_sar));
  return p_product_id;
end
$$;
revoke all on function public.demo_save_product_draft(uuid,text,text,text,numeric) from public,anon;
grant execute on function public.demo_save_product_draft(uuid,text,text,text,numeric) to authenticated;
