(() => {
  'use strict';

  const supabase = window.supabaseClient;
  const $ = (id) => document.getElementById(id);
  const state = { session: null, profile: null, categories: [], levels: [], sublevels: [], challenges: [] };

  const pageMeta = {
    dashboard: ['VUE D’ENSEMBLE', 'Tableau de bord', '⌂', 'Les indicateurs de pilotage de Road to Elite.'],
    users: ['GESTION DES COMPTES', 'Utilisateurs', '👥', 'Consultez et gérez les joueurs, coachs, parents et clubs.'],
    challenges: ['GESTION DU CONTENU', 'Défis', '🎯', 'Créez, publiez et classez les défis de l’académie.'],
    studio: ['CRÉATION TACTIQUE', 'Studio Road to Elite', '⚽', 'L’éditeur tactique stable sera intégré ici sans modifier son fonctionnement actuel.'],
    games: ['ENTRAÎNEMENT COGNITIF', 'Jeux cognitifs', '🧠', 'Gérez les jeux, leurs paramètres et leurs niveaux de difficulté.'],
    academy: ['PROGRAMME PÉDAGOGIQUE', 'Académie tactique', '📚', 'Organisez les chapitres, compétences et parcours tactiques.'],
    library: ['RESSOURCES', 'Bibliothèque centrale', '▣', 'Centralisez progressivement images, vidéos, terrains, joueurs, sons et documents.'],
    statistics: ['ANALYSE', 'Statistiques', '▥', 'Suivez les tentatives, scores, progressions et usages de la plateforme.'],
    rankings: ['PERFORMANCE', 'Classements', '🏆', 'Pilotez les classements par niveau et sous-niveau.'],
    settings: ['CONFIGURATION', 'Paramètres', '⚙', 'Réglez les options globales de Road to Elite.']
  };

  function setHidden(el, hidden) { el.classList.toggle('hidden', hidden); }
  function showMessage(el, text, success = false) { el.textContent = text || ''; el.classList.toggle('success', success); }
  function slugify(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
  function formatDate(value) { return value ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'; }
  function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }

  async function bootstrap() {
    if (!supabase) {
      $('loading').innerHTML = '<strong>Connexion Supabase indisponible</strong><span>Vérifiez js/supabase.js.</span>';
      return;
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error(error);
    if (!session) return showLogin();
    await authorize(session);
  }

  function showLogin(message = '') {
    state.session = null; state.profile = null;
    setHidden($('loading'), true); setHidden($('adminView'), true); setHidden($('loginView'), false);
    showMessage($('loginMessage'), message);
  }

  async function authorize(session) {
    state.session = session;
    const { data: profile, error } = await supabase.from('profiles').select('id, role, first_name, last_name, avatar_url').eq('id', session.user.id).single();
    if (error || !profile) {
      await supabase.auth.signOut();
      return showLogin('Profil introuvable. Vérifiez la création du profil dans Supabase.');
    }
    if (profile.role !== 'admin') {
      await supabase.auth.signOut();
      return showLogin('Accès refusé : ce compte ne possède pas le rôle administrateur.');
    }
    state.profile = profile;
    showAdmin();
    await loadDashboard();
  }

  function showAdmin() {
    const fullName = [state.profile.first_name, state.profile.last_name].filter(Boolean).join(' ') || 'Administrateur';
    $('sidebarName').textContent = fullName;
    $('sidebarEmail').textContent = state.session.user.email || '';
    $('sidebarAvatar').textContent = fullName.charAt(0).toUpperCase();
    $('welcomeTitle').textContent = `Bonjour ${state.profile.first_name || ''}`.trim() + ', pilotez Road to Elite';
    setHidden($('loading'), true); setHidden($('loginView'), true); setHidden($('adminView'), false);
  }

  async function login(event) {
    event.preventDefault();
    const button = $('loginButton'); button.disabled = true; button.textContent = 'Connexion…';
    showMessage($('loginMessage'), '');
    const { data, error } = await supabase.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value });
    button.disabled = false; button.textContent = 'Se connecter';
    if (error) return showMessage($('loginMessage'), error.message === 'Invalid login credentials' ? 'E-mail ou mot de passe incorrect.' : error.message);
    await authorize(data.session);
  }

  async function logout() { await supabase.auth.signOut(); showLogin('Vous êtes déconnecté.'); }

  async function count(table, filter) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) query = query.eq(filter.column, filter.value);
    const { count, error } = await query;
    if (error) { console.warn(`[Admin] ${table}:`, error.message); return null; }
    return count ?? 0;
  }

  async function loadDashboard() {
    $('refreshButton').disabled = true;
    const [players, coaches, clubs, challenges, attempts, levels] = await Promise.all([
      count('profiles', { column: 'role', value: 'player' }), count('profiles', { column: 'role', value: 'coach' }), count('profiles', { column: 'role', value: 'club' }), count('challenges'), count('challenge_attempts'), count('levels', { column: 'is_active', value: true })
    ]);
    $('playersCount').textContent = players ?? '—'; $('coachesCount').textContent = coaches ?? '—'; $('clubsCount').textContent = clubs ?? '—'; $('challengesCount').textContent = challenges ?? '—'; $('attemptsCount').textContent = attempts ?? '—'; $('levelsCount').textContent = levels ?? '—';
    await Promise.all([loadReferenceData(), loadChallenges()]);
    $('refreshButton').disabled = false;
  }

  async function loadReferenceData() {
    const [categoriesResult, levelsResult, sublevelsResult] = await Promise.all([
      supabase.from('challenge_categories').select('*').order('display_order'), supabase.from('levels').select('*').order('display_order'), supabase.from('sublevels').select('*').order('display_order')
    ]);
    state.categories = categoriesResult.data || []; state.levels = levelsResult.data || []; state.sublevels = sublevelsResult.data || [];
    $('challengeCategory').innerHTML = state.categories.map(x => `<option value="${x.id}">${escapeHtml(x.name)}</option>`).join('');
    $('challengeLevel').innerHTML = state.levels.map(x => `<option value="${x.id}">${escapeHtml(x.name)}</option>`).join('');
    updateSublevels();
  }

  async function loadChallenges() {
    const { data, error } = await supabase.from('challenges').select('id,title,slug,status,xp_reward,created_at,category_id,level_id,sublevel_id').order('created_at', { ascending: false }).limit(200);
    if (error) { console.warn(error); state.challenges = []; }
    else state.challenges = data || [];
    renderRecent(); renderAllChallenges();
  }

  function nameById(list, id) { return list.find(x => Number(x.id) === Number(id))?.name || '—'; }
  function challengeRow(item, includeSublevel = false) {
    const base = `<td><strong>${escapeHtml(item.title)}</strong></td><td>${escapeHtml(nameById(state.categories,item.category_id))}</td><td>${escapeHtml(nameById(state.levels,item.level_id))}</td>`;
    const sub = includeSublevel ? `<td>${escapeHtml(nameById(state.sublevels,item.sublevel_id))}</td>` : '';
    return `<tr>${base}${sub}<td><span class="pill ${item.status}">${item.status === 'published' ? 'Publié' : item.status === 'draft' ? 'Brouillon' : 'Archivé'}</span></td><td>${Number(item.xp_reward)||0}</td>${includeSublevel ? '' : `<td>${formatDate(item.created_at)}</td>`}</tr>`;
  }

  function renderRecent() { $('recentChallenges').innerHTML = state.challenges.length ? state.challenges.slice(0,6).map(x => challengeRow(x)).join('') : '<tr><td colspan="6" class="empty-cell">Aucun défi pour le moment.</td></tr>'; }
  function renderAllChallenges() {
    const search = $('challengeSearch').value.trim().toLowerCase(), status = $('challengeStatusFilter').value;
    const filtered = state.challenges.filter(x => (!search || x.title.toLowerCase().includes(search)) && (!status || x.status === status));
    $('allChallenges').innerHTML = filtered.length ? filtered.map(x => challengeRow(x,true)).join('') : '<tr><td colspan="6" class="empty-cell">Aucun défi correspondant.</td></tr>';
  }

  function updateSublevels() {
    const levelId = Number($('challengeLevel').value);
    const items = state.sublevels.filter(x => Number(x.level_id) === levelId);
    $('challengeSublevel').innerHTML = '<option value="">Aucun</option>' + items.map(x => `<option value="${x.id}">${escapeHtml(x.name)}</option>`).join('');
  }

  function openChallengeDialog() {
    $('challengeForm').reset(); $('challengePoints').value = 50; $('challengeXp').value = 50;
    if (state.levels[0]) $('challengeLevel').value = state.levels[0].id;
    updateSublevels(); showMessage($('challengeMessage'), ''); $('challengeDialog').showModal();
  }

  async function saveChallenge(event) {
    event.preventDefault();
    const button = $('saveChallenge'); button.disabled = true; button.textContent = 'Enregistrement…';
    const title = $('challengeTitle').value.trim();
    const payload = { category_id:Number($('challengeCategory').value), level_id:Number($('challengeLevel').value), sublevel_id:$('challengeSublevel').value ? Number($('challengeSublevel').value) : null, title, slug:`${slugify(title)}-${Date.now().toString().slice(-6)}`, description:$('challengeDescription').value.trim()||null, challenge_type:$('challengeType').value, duration_seconds:$('challengeDuration').value ? Number($('challengeDuration').value) : null, points:Number($('challengePoints').value)||0, xp_reward:Number($('challengeXp').value)||0, status:$('challengeStatus').value, created_by:state.session.user.id };
    const { error } = await supabase.from('challenges').insert(payload);
    button.disabled = false; button.textContent = 'Enregistrer le défi';
    if (error) return showMessage($('challengeMessage'), error.message);
    showMessage($('challengeMessage'), 'Défi enregistré dans Supabase.', true);
    await loadChallenges(); await new Promise(r => setTimeout(r,550)); $('challengeDialog').close();
  }

  function openPage(page) {
    const meta = pageMeta[page] || pageMeta.dashboard;
    document.querySelectorAll('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.page === page));
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    $('pageEyebrow').textContent = meta[0]; $('pageTitle').textContent = meta[1];
    if (page === 'dashboard') $('dashboardPage').classList.add('active');
    else if (page === 'challenges') { $('challengesPage').classList.add('active'); renderAllChallenges(); }
    else { $('genericPage').classList.add('active'); $('genericIcon').textContent=meta[2]; $('genericTitle').textContent=meta[1]; $('genericDescription').textContent=meta[3]; const action=$('genericAction'); setHidden(action,true); if(page==='studio'){action.textContent='Intégrer l’éditeur stable'; setHidden(action,false);} }
    closeSidebar();
  }

  function openSidebar(){ $('sidebar').classList.add('open'); setHidden($('sidebarBackdrop'),false); }
  function closeSidebar(){ $('sidebar').classList.remove('open'); setHidden($('sidebarBackdrop'),true); }

  $('loginForm').addEventListener('submit', login);
  $('togglePassword').addEventListener('click', () => { const input=$('password'); input.type=input.type==='password'?'text':'password'; });
  $('logoutButton').addEventListener('click', logout);
  $('refreshButton').addEventListener('click', loadDashboard);
  ['newChallengeTop','newChallengeQuick','newChallengePage'].forEach(id => $(id).addEventListener('click',openChallengeDialog));
  $('closeChallengeDialog').addEventListener('click',()=>$('challengeDialog').close()); $('cancelChallenge').addEventListener('click',()=>$('challengeDialog').close()); $('challengeForm').addEventListener('submit',saveChallenge); $('challengeLevel').addEventListener('change',updateSublevels);
  $('challengeSearch').addEventListener('input',renderAllChallenges); $('challengeStatusFilter').addEventListener('change',renderAllChallenges);
  document.querySelectorAll('.nav-item').forEach(x=>x.addEventListener('click',()=>openPage(x.dataset.page))); document.querySelectorAll('[data-open-page]').forEach(x=>x.addEventListener('click',()=>openPage(x.dataset.openPage)));
  ['openStudioHero','openStudioQuick'].forEach(id=>$(id).addEventListener('click',()=>openPage('studio')));
  $('openSidebar').addEventListener('click',openSidebar); $('closeSidebar').addEventListener('click',closeSidebar); $('sidebarBackdrop').addEventListener('click',closeSidebar);
  supabase?.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') showLogin(); });
  bootstrap().catch(error => { console.error(error); $('loading').innerHTML='<strong>Erreur de démarrage</strong><span>Consultez la console du navigateur.</span>'; });
})();
