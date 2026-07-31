-- ROAD TO ELITE — DROITS ADMIN COMPATIBLES AVEC LA BASE ACTUELLE
-- Script idempotent : peut être réexécuté sans créer de doublons.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'::public.user_role
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can manage categories" on public.challenge_categories;
create policy "Admins can manage categories"
on public.challenge_categories for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can manage levels" on public.levels;
create policy "Admins can manage levels"
on public.levels for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can manage sublevels" on public.sublevels;
create policy "Admins can manage sublevels"
on public.sublevels for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can manage challenges" on public.challenges;
create policy "Admins can manage challenges"
on public.challenges for all to authenticated
using (public.is_admin())
with check (public.is_admin() and (created_by is null or created_by = auth.uid()));

drop policy if exists "Admins can view all attempts" on public.challenge_attempts;
create policy "Admins can view all attempts"
on public.challenge_attempts for select to authenticated
using (public.is_admin());
