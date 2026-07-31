# Road to Elite — Version 3 avec Back Office

## Adresse locale / déployée
- Application joueur : `/index.html`
- Administration : `/admin/`

## Mise en service de l’administration
1. Dans Supabase SQL Editor, exécuter `admin/sql/ADMIN_POLICIES.sql`.
2. Créer votre utilisateur dans Authentication > Users.
3. Dans `admin/sql/MAKE_FIRST_ADMIN.sql`, remplacer les deux occurrences de `REMPLACEZ_PAR_VOTRE_EMAIL`.
4. Exécuter le script modifié.
5. Déployer le dossier complet sur GitHub/Vercel.
6. Ouvrir `/admin/` puis se connecter.

## Déjà fonctionnel
- Connexion sécurisée par Supabase Auth.
- Refus automatique des comptes non-admin.
- Compteurs Supabase : joueurs, coachs, clubs, défis, tentatives et niveaux.
- Liste des derniers défis.
- Liste et recherche des défis.
- Création d’un défi directement dans Supabase.
- Navigation responsive du Back Office.
- Emplacement préparé pour le Studio tactique existant.
