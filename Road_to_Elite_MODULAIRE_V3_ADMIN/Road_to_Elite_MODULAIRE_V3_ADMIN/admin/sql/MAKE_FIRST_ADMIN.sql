-- ROAD TO ELITE — ATTRIBUER LE PREMIER RÔLE ADMIN
-- 1) Créez d'abord votre compte dans Supabase Authentication > Users.
-- 2) Remplacez l'e-mail ci-dessous par l'e-mail exact de ce compte.
-- 3) Exécutez ce script une seule fois.

update public.profiles p
set role = 'admin'::public.user_role,
    is_active = true,
    updated_at = now()
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('REMPLACEZ_PAR_VOTRE_EMAIL');

-- Vérification : doit retourner votre profil avec role = admin.
select p.id, u.email, p.first_name, p.last_name, p.role, p.is_active
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('REMPLACEZ_PAR_VOTRE_EMAIL');
