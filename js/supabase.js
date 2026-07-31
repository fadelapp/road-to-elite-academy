// ROAD TO ELITE — Connexion publique Supabase
// La clé publishable est conçue pour être utilisée côté navigateur.
// Ne jamais placer ici une clé secret/service_role.

(function initRoadToEliteSupabase() {
  const SUPABASE_URL = 'https://cnjxpjkqooorikarpwoo.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-V2STSZU8UoPxaTJ7ZbwYg_Ax_Sj6CX';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Road to Elite] Bibliothèque Supabase introuvable.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  window.supabaseClient.auth.getSession()
    .then(({ error }) => {
      if (error) {
        console.error('[Road to Elite] Erreur de connexion Supabase :', error.message);
        return;
      }
      console.info('[Road to Elite] Supabase connecté.');
    })
    .catch((error) => {
      console.error('[Road to Elite] Connexion Supabase impossible :', error);
    });
})();
