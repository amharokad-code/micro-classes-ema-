// ============================================
// CONFIG À REMPLIR
// ============================================
const CONFIG = {
  formspreeId: "REMPLACE_PAR_TON_ID",       // ex: xyzabc12
  calcomUsername: "REMPLACE_PAR_TON_USERNAME", // ex: ema-tutorat
  emailInterac: "paiement@ema-tutorat.ca",
  pdfUrl: "https://link-vers-ton-pdf.com"
};

// ============================================
// NAVIGATION ENTRE VUES
// ============================================
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  window.scrollTo(0, 0);
}

function goToLanding() {
  showView('view-landing');
}

function goToAuth(tab = 'login') {
  showView('view-auth');
  switchAuthTab(tab);
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// AUTH TABS (Login / Signup)
// ============================================
function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    formLogin.classList.remove('hidden');
    formSignup.classList.add('hidden');
  } else {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    formSignup.classList.remove('hidden');
    formLogin.classList.add('hidden');
  }
  hideAuthError();
}

function showAuthError(message) {
  const errorBox = document.getElementById('auth-error');
  const errorText = document.getElementById('auth-error-text');
  errorText.textContent = message;
  errorBox.classList.remove('hidden');
}

function hideAuthError() {
  document.getElementById('auth-error').classList.add('hidden');
}

// ============================================
// SIMULATION D'AUTHENTIFICATION (localStorage)
// ============================================

// SIGNUP
function handleSignup(event) {
  event.preventDefault();

  const firstname = document.getElementById('signup-firstname').value.trim();
  const lastname = document.getElementById('signup-lastname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!firstname || !lastname || !email || !password) {
    showAuthError("Remplis tous les champs obligatoires.");
    return;
  }

  // Vérifie si l'utilisateur existe déjà
  const users = JSON.parse(localStorage.getItem('ema_users') || '[]');
  if (users.find(u => u.email === email)) {
    showAuthError("Ce courriel est déjà utilisé. Connecte-toi plutôt.");
    return;
  }

  // Crée le nouvel utilisateur
  const newUser = {
    id: Date.now(),
    firstname,
    lastname,
    email,
    phone,
    password, // NOTE: En prod, JAMAIS stocker en clair. Ici c'est une simulation locale.
    createdAt: new Date().toISOString(),
    hoursCompleted: 0,
    progressPoints: 0,
    nextSession: null,
    payments: [],
    arbres: []
  };

  users.push(newUser);
  localStorage.setItem('ema_users', JSON.stringify(users));

  // Envoi automatique via Formspree (simulation d'automatisation)
  sendToFormspree(newUser);

  // Connecte automatiquement l'utilisateur
  loginUser(newUser);
}

// LOGIN
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('ema_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showAuthError("Courriel ou mot de passe incorrect.");
    return;
  }

  loginUser(user);
}

// GOOGLE AUTH (simulation)
function handleGoogleAuth() {
  // Simulation: crée un utilisateur "démo Google"
  const users = JSON.parse(localStorage.getItem('ema_users') || '[]');
  let user = users.find(u => u.email === 'demo.google@gmail.com');

  if (!user) {
    user = {
      id: Date.now(),
      firstname: 'Utilisateur',
      lastname: 'Google',
      email: 'demo.google@gmail.com',
      phone: '',
      password: null,
      createdAt: new Date().toISOString(),
      hoursCompleted: 0,
      progressPoints: 0,
      nextSession: null,
      payments: [],
      arbres: []
    };
    users.push(user);
    localStorage.setItem('ema_users', JSON.stringify(users));
  }

  loginUser(user);
}

// Connecte l'utilisateur et va au dashboard
function loginUser(user) {
  localStorage.setItem('ema_current_user', JSON.stringify(user));
  loadDashboard(user);
  showView('view-dashboard');
}

function handleLogout() {
  localStorage.removeItem('ema_current_user');
  goToLanding();
}

// ============================================
// FORMSPREE - Automatisation inscription
// ============================================
function sendToFormspree(user) {
  if (CONFIG.formspreeId === "REMPLACE_PAR_TON_ID") {
    console.warn("⚠️ Formspree ID non configuré. Inscription simulée localement seulement.");
    return;
  }

  fetch(`https://formspree.io/f/${CONFIG.formspreeId}`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prenom: user.firstname,
      nom: user.lastname,
      email: user.email,
      telephone: user.phone,
      message: `Nouvelle inscription E.M.A. Tutorat — ${user.firstname} ${user.lastname}`
    })
  })
  .then(res => {
    if (res.ok) {
      console.log("✅ Inscription envoyée via Formspree");
    }
  })
  .catch(err => console.error("Erreur Formspree:", err));
}

// ============================================
// DASHBOARD - Chargement des données utilisateur
// ============================================
function loadDashboard(user) {
  // Nom + initiales
  document.getElementById('welcome-name').textContent = user.firstname;
  document.getElementById('dash-user-name').textContent = `${user.firstname} ${user.lastname}`;
  document.getElementById('dash-user-initials').textContent =
    (user.firstname[0] + (user.lastname[0] || '')).toUpperCase();

  // Stats
  document.getElementById('stat-hours').textContent = `${user.hoursCompleted} h`;
  document.getElementById('stat-progress').textContent =
    user.progressPoints > 0 ? `+${user.progressPoints} pts` : '— pts';

  if (user.nextSession) {
    document.getElementById('stat-next-session').textContent = user.nextSession.date;
    document.getElementById('stat-next-time').textContent = user.nextSession.time;
  } else {
    document.getElementById('stat-next-session').textContent = 'Aucune séance';
    document.getElementById('stat-next-time').textContent = 'Réserve via le calendrier';
  }

  // Cal.com iframe (dynamique selon config)
  const iframe = document.getElementById('calcom-iframe');
  if (CONFIG.calcomUsername !== "REMPLACE_PAR_TON_USERNAME") {
    iframe.src = `https://cal.com/${CONFIG.calcomUsername}`;
  }

  // Email de paiement
  document.getElementById('payment-email').textContent = CONFIG.emailInterac;

  // Historique paiements
  const paymentList = document.getElementById('payment-history-list');
  if (user.payments && user.payments.length > 0) {
    paymentList.classList.remove('empty-state');
    paymentList.innerHTML = user.payments.map(p => `
      <div class="payment-detail">
        <span>${p.date}</span>
        <strong>${p.amount} $ — ${p.status}</strong>
      </div>
    `).join('');
  }

  // Arbres décisionnels (Coffre-fort)
  const arbresList = document.getElementById('arbres-list');
  if (user.arbres && user.arbres.length > 0) {
    arbresList.innerHTML = user.arbres.map(a => `
      <div class="arbre-card">
        <h4>🌳 ${a.titre}</h4>
        <p>${a.description}</p>
        <button class="btn btn-ghost" onclick="window.open('${a.lien}', '_blank')">Voir l'arbre</button>
      </div>
    `).join('');
  }
}

// ============================================
// DASHBOARD - Navigation entre onglets
// ============================================
function switchDashTab(tab) {
  document.querySelectorAll('.dash-nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.dash-section').forEach(sec => sec.classList.remove('active'));

  document.getElementById(`dash-${tab}`).classList.add('active');

  const navItems = document.querySelectorAll('.dash-nav-item');
  const tabIndex = ['accueil','calendrier','paiements','progression','coffre','contact'].indexOf(tab);
  if (navItems[tabIndex]) navItems[tabIndex].classList.add('active');
}

// ============================================
// ACCORDÉON MÉTHODE
// ============================================
function toggleAccordion(header) {
  const item = header.parentElement;
  item.classList.toggle('open');
}

// ============================================
// INIT - Vérifie si utilisateur déjà connecté
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('ema_current_
