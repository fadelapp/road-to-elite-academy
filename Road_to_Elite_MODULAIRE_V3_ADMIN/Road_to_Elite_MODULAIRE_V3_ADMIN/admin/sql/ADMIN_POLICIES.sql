-- ROAD TO ELITE — DROITS DU BACK OFFICE
-- À exécuter une seule fois dans Supabase > SQL Editor.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'::public.user_role
      and is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (public.is_admin());

create policy "Admins can view all categories"
on public.challenge_categories for select to authenticated
using (public.is_admin());

create policy "Admins can manage categories"
on public.challenge_categories for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins can view all levels"
on public.levels for select to authenticated
using (public.is_admin());

create policy "Admins can manage levels"
on public.levels for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins can view all sublevels"
on public.sublevels for select to authenticated
using (public.is_admin());

create policy "Admins can manage sublevels"
on public.sublevels for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins can view all challenges"
on public.challenges for select to authenticated
using (public.is_admin());

create policy "Admins can create challenges"
on public.challenges for insert to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "Admins can update challenges"
on public.challenges for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete challenges"
on public.challenges for delete to authenticated
using (public.is_admin());

create policy "Admins can view all attempts"
on public.challenge_attempts for select to authenticated
using (public.is_admin());
