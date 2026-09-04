-- BMB WEAR — Auth admin + RLS durcies (PHASE 1)
-- Exécuter APRÈS schema.sql. Ne casse pas le site client (insert commandes/clients/messages + lecture catalogue restent publics).
-- 1) Crée d'abord l'utilisateur admin : Dashboard Supabase > Authentication > Users > Add user (email + mot de passe)
-- 2) Exécute ce fichier, en remplaçant l'email ci-dessous par le tien :
--    update auth.users set raw_user_meta_data = raw_user_meta_data || '{"is_admin":true}'::jsonb where email = 'TON-EMAIL';

-- Nettoyage politiques permissives
drop policy if exists "anon write products" on products;
drop policy if exists "anon write colors" on colors;
drop policy if exists "anon write customers" on customers;
drop policy if exists "anon write orders" on orders;
drop policy if exists "anon write settings" on settings;
drop policy if exists "anon upload photos" on storage.objects;
drop policy if exists "anon update photos" on storage.objects;

-- Lecture publique (catalogue + suivi + paramètres d'affichage)
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);
drop policy if exists "public read colors" on colors;
create policy "public read colors" on colors for select using (true);
drop policy if exists "public read photos" on storage.objects;
create policy "public read photos" on storage.objects for select using (bucket_id='product-photos');
drop policy if exists "public read orders" on orders;
create policy "public read orders" on orders for select using (true);
drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings for select using (true);

-- Écritures métier publiques minimales (clients non connectés)
drop policy if exists "anon insert orders" on orders;
create policy "anon insert orders" on orders for insert with check (true);
drop policy if exists "anon insert customers" on customers;
create policy "anon insert customers" on customers for insert with check (true);
drop policy if exists "anon insert messages" on messages;
create policy "anon insert messages" on messages for insert with check (true);

-- Tout le reste = admin authentifié uniquement
create policy "admin all products" on products for all
using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'))
with check (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin all colors" on colors for all
using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'))
with check (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin all orders" on orders for update using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin del orders" on orders for delete using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin all customers" on customers for all
using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'))
with check (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin read messages" on messages for select using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin write messages" on messages for update using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin del messages" on messages for delete using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin all settings" on settings for all
using (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'))
with check (((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin write photos" on storage.objects for insert with check (bucket_id='product-photos' and ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin update photos" on storage.objects for update using (bucket_id='product-photos' and ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));
create policy "admin del photos" on storage.objects for delete using (bucket_id='product-photos' and ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'));

-- NOTE HONNÊTE : la lecture des commandes reste publique (le suivi client lit par N°+tél sans auth).
-- Vrai cloisonnement par client = comptes Supabase Auth côté boutique (phase suivante).
