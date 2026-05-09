
insert into storage.buckets (id, name, public) values ('item-images', 'item-images', true)
on conflict (id) do nothing;

create policy "public read item-images"
on storage.objects for select
using (bucket_id = 'item-images');

create policy "admin upload item-images"
on storage.objects for insert to authenticated
with check (bucket_id = 'item-images' and public.has_role(auth.uid(), 'admin'));

create policy "admin update item-images"
on storage.objects for update to authenticated
using (bucket_id = 'item-images' and public.has_role(auth.uid(), 'admin'));

create policy "admin delete item-images"
on storage.objects for delete to authenticated
using (bucket_id = 'item-images' and public.has_role(auth.uid(), 'admin'));
