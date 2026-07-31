-- Remplace TON_EMAIL_ICI par l'adresse du compte créé dans Authentication > Users.
update public.profiles
set role = 'admin'::public.user_role,
    updated_at = now()
where id = (
  select id from auth.users where email = 'TON_EMAIL_ICI'
);

select p.id, u.email, p.first_name, p.last_name, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'TON_EMAIL_ICI';
