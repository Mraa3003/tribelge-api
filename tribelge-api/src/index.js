// TriBelge API — Serveur principal Express
// ─────────────────────────────────────────────────────────────────────────────
// Installation : npm install
// Démarrage   : node src/index.js   ou   npm run dev (avec nodemon)
// Variables   : ANTHROPIC_API_KEY=sk-... (requis pour /classify/photo)
//               PORT=3000 (optionnel, défaut 3000)
// ─────────────────────────────────────────────────────────────────────────────
require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");

const classifyRoutes = require("./routes/classify");
const dataRoutes     = require("./routes/data");
const userRoutes     = require("./routes/user");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware globaux ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
app.use(express.json({ limit:"10mb" }));  // 10MB pour les images base64

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      100,              // 100 requêtes / 15 min / IP
  message:  { error:"Trop de requêtes. Réessayez dans 15 minutes." },
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max:      10,         // 10 appels IA / min / IP
  message:  { error:"Limite IA atteinte. Réessayez dans 1 minute." },
});
app.use(limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/classify",    aiLimiter, classifyRoutes);  // POST /classify/photo|barcode
app.use("/objects",     dataRoutes);                  // GET  /objects, /objects/:id
app.use("/rules",       dataRoutes);                  // GET  /rules/:region, /rules/:region/:flux
app.use("/communes",    dataRoutes);                  // GET  /communes/:region
app.use("/recyparks",   dataRoutes);                  // GET  /recyparks
app.use("/",            userRoutes);                  // POST /feedback, /auth, GET /user/...

// ── GET / — Documentation rapide ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name:        "TriBelge API",
    version:     "1.0.0",
    description: "Tri sélectif belge — 3 régions, 32 objets, FR/NL/EN",
    endpoints: {
      classify: {
        "POST /classify/photo":   "Photo (base64) → flux de tri",
        "POST /classify/barcode": "Code-barres → flux de tri (Open Food Facts)",
      },
      data: {
        "GET /objects":               "Liste des 32 objets (?flux=PMC&lang=fr)",
        "GET /objects/:id":           "Détail d'un objet avec règles par région",
        "GET /rules/:region":         "Règles d'une région (bruxelles|flandre|wallonie)",
        "GET /rules/:region/:flux":   "Règles d'un flux précis (PMC|Papier|Verre|...)",
        "GET /communes/:region":      "Communes d'une région (?search=ixelles)",
        "GET /recyparks":             "Points de collecte (?region=bruxelles&lat=50.85&lng=4.35)",
      },
      user: {
        "POST /auth/register":        "Créer un compte (retourne token démo)",
        "GET  /user/history":         "Historique de tris (Auth requis)",
        "POST /user/history":         "Enregistrer un tri (Auth requis)",
        "GET  /user/favorites":       "Favoris (Auth requis)",
        "POST /user/favorites":       "Ajouter un favori (Auth requis)",
        "DELETE /user/favorites/:id": "Supprimer un favori (Auth requis)",
      },
      feedback: {
        "POST /feedback":       "Feedback sur un résultat (correct/incorrect)",
        "GET  /feedback/stats": "Statistiques des feedbacks (admin)",
      },
    },
    regions:  ["bruxelles","flandre","wallonie"],
    languages:["fr","nl","en"],
    objects_count: 32,
    docs: "https://github.com/tribelge/api (à créer)",
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error:    `Route '${req.method} ${req.path}' not found`,
    hint:     "GET / for full API documentation",
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ error:"Internal server error", details: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n♻️  TriBelge API v1.0.0`);
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📋 Documentation : GET http://localhost:${PORT}/`);
  console.log(`🔑 ANTHROPIC_API_KEY : ${process.env.ANTHROPIC_API_KEY ? "✅ configurée" : "❌ manquante (requis pour /classify/photo)"}\n`);
});

module.exports = app;
