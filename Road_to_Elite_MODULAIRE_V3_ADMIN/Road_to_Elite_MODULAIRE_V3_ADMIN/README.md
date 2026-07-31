# Road to Elite — version modulaire 1

Cette version conserve l’interface et le fonctionnement de la version nettoyée, mais sépare déjà :

- `index.html` : structure de l’application ;
- `css/main.css` : styles ;
- `js/app.js` : logique générale ;
- `jeux/stroop/index.html` : jeu Stroop ;
- `jeux/bimanuel/index.html` : jeu bimanuel ;
- `modules/conduite-balle/index.html` : module conduite de balle ;
- `modules/physique/index.html` : module physique.

Le jeu de suivi d’objet reste provisoirement dans `js/app.js` car il partage encore plusieurs éléments avec la logique générale. Il sera isolé après validation de cette première version.

## Installation

Copier tout le contenu de ce dossier à la racine du dépôt GitHub. `index.html` doit rester à la racine.

## Connexion Supabase

La connexion publique est configurée dans `js/supabase.js`.
Le client est disponible dans le navigateur via `window.supabaseClient`.
La clé utilisée est une clé publishable publique. Ne jamais ajouter de clé `secret` ou `service_role` au projet frontend.
