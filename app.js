/* ============================================
   E.M.A. TUTORAT — APP LOGIC & AUTOMATION
   Scalable, zero-dependency, pure vanilla JS
   ============================================ */

// ========== CONFIGURATION (À REMPLIR) ==========
const CONFIG = {
  formspreeId: "YOUR_FORMSPREE_ID", // formspree.io → copie l'ID
  calUsername: "majid",              // cal.com username public
  interacEmail: "majid@email.com",   // courriel dépôt auto
  pdfUrl: "assets/arbre-quadratique.pdf" // où tu mets ton PDF
};

const TARIFS = [
  {
    id: "micro",
    titre: "Micro-classe",
    sousTitre: "3-6 élèves",
    prix: 75,
    devise: " $ /séance",
    description: "Groupe d'étude intensif. Chaque élève progresse à son rythme.",
    featured: false,
    features: [
      "3-6 élèves max",
      "Algorithmes E.M.A.",
      "Interaction directe",
      "Q&A illimitées"
    ]
  },
  {
    id: "prive",
    titre: "Classe privée",
    sousTitre: "1 élève",
    prix: 150,
    devise: " $ /séance",
    description: "Tutoring 1-on-1. Adapter au besoin exact de ton élève.",
    featured: true,
    features: [
      "1 élève seul",
      "Plan personnalisé",
      "Suivi complet",
      "Progrès garantis"
    ]
  }
];

const ARBRES = [
  {
    id: "quadratique",
    titre: "Fonction Quadratique",
    niveau: "SN4",
    statut: "Disponible",
    description: "Trouver le sommet, axe de symétrie, discriminant. Méthodologie en 5 étapes."
  },
  {
    id: "exponentielle",
    titre: "Fonction Exponentielle",
    niveau: "SN4",
    statut: "Disponible",
    description: "Croissance/décroissance, asymptotes, transformations graphiques."
  },
  {
    id: "logarithmique",
    titre: "Fonction Logarithmique",
    niveau: "SN4",
    statut: "Bientôt",
    description: "Inverse de l'exponentielle. Équations logarithmiques résolues."
  },
  {
    id: "trigonometrie",
    titre: "Trigonométrie",
    niveau: "SN4",
    statut: "Bientôt",
    description: "Sinus, cosinus, tangente. Identités et équations trig."
  },
  {
    id: "matrices",
    titre: "Matrices",
    niveau: "SN4",
    statut: "Bientôt",
    description: "Opérations matricielles, déterminant, inversion."
  },
  {
    id: "vecteurs",
    titre: "Vecteurs",
    niveau: "SN4",
    statut: "Disponible",
    description: "Produit scalaire, norme, composantes, projection."
  }
];

// ========== STATE MANAGEMENT ==========
let appState = {
  userEmail: localStorage.getItem("emaUserEmail") || null,
  portalUnlocked: localStorage.getItem("emaPortalUnlocked") === "true"
};

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  renderPricingGrid();
  renderPortalGrid();
  updatePortalVisibility();
  setupFormListener();
  setupNavigation();
  updateInteracEmail();
}

// ========== PRICING GRID ==========
function renderPricingGrid() {
  const grid = document.getElementById("pricing-grid");
  if (!grid) return;

  grid.innerHTML = TARIFS.map(tarif => `
    <div class="pricing-card ${tarif.featured ? "featured" : ""}">
      ${tarif.featured ? '<div class="pricing-badge">Populaire</div>' : ""}
      <h3>${tarif.titre}</h3>
      <p style="color: #64748B; font-size: 0.95rem; margin-bottom: 1rem;">
        ${tarif.sousTitre}
      </p>
      <div class="pricing-price">
        $${tarif.prix}<small>/${tarif.devise.split('/')[1]}</small>
      </div>
      <p class="pricing-description">${tarif.description}</p>
      <ul class="pricing-features">
        ${tarif.features.map(f => `<li>${f}</li>`).join("")}
      </ul>
      <button class="btn-primary" onclick="scrollToSection('#reservation')">
        Réserver une place
      </button>
    </div>
  `).join("");
}

// ========== PORTAL GRID ==========
function renderPortalGrid() {
  const grid = document.getElementById("portal-grid");
  if (!grid) return;

  grid.innerHTML = ARBRES.map(arbre => {
    const isAvailable = arbre.statut === "Disponible";
    return `
      <div class="portal-card ${!isAvailable ? "unavailable" : ""}">
        <div class="portal-card-title">${arbre.titre}</div>
        <div>
          <span class="portal-card-level">${arbre.niveau}</span>
          <span class="portal-card-status ${isAvailable ? "available" : "coming-soon"}">
            ${arbre.statut}
          </span>
        </div>
        <p style="color: #64748B; font-size: 0.9rem; margin-top: 0.75rem;">
          ${arbre.description}
        </p>
        ${isAvailable ? `
          <button 
            class="btn-secondary" 
            style="margin-top: 1rem; width: 100%;"
            onclick="downloadArbre('${arbre.id}')"
          >
            Télécharger →
          </button>
        ` : `
          <p style="color: #94A3B8; font-size: 0.85rem; margin-top: 1rem; font-style: italic;">
            Reviens bientôt!
          </p>
        `}
      </div>
    `;
  }).join("");
}

// ========== FORM SUBMISSION ==========
function setupFormListener() {
  const form = document.getElementById("lead-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const nom = document.getElementById("nom").value.trim();

    // Validation
    if (!email || !nom) {
      alert("Remplis ton email et le prénom.");
      return;
    }

    // Formspree submission
    fetch(`https://formspree.io/f/${CONFIG.formspreeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nom })
    })
      .then(() => {
        // Success
        appState.userEmail = email;
        appState.portalUnlocked = true;

        localStorage.setItem("emaUserEmail", email);
        localStorage.setItem("emaPortalUnlocked", "true");

        // Show confirmation
        form.classList.add("hidden");
        document.getElementById("form-confirmation").classList.remove("hidden");
        document.getElementById("direct-download-link").href = CONFIG.pdfUrl;

        // Unlock portal
        updatePortalVisibility();

        // Scroll to confirmation
        setTimeout(() => scrollToSection("#form-confirmation"), 100);
      })
      .catch(err => {
        console.error("Erreur Formspree:", err);
        alert("Une erreur s'est produite. Réessaie.");
      });
  });
}

// ========== PORTAL VISIBILITY ==========
function updatePortalVisibility() {
  const portal = document.getElementById("portal");
  if (!portal) return;

  if (app
