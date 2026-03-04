// TriBelge — Routes /feedback et /user (historique, favoris)
const express = require("express");
const router  = express.Router();

// ── Stockage en mémoire (remplacer par DB en production) ──────────────────────
const feedbackStore = [];
const usersStore    = {};   // { userId: { history:[], favorites:[] } }

// ── Simple auth middleware (JWT simulé pour démo) ─────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ error:"Authorization required. Header: Bearer <token>" });
  // En production : vérifier JWT. Ici on extrait l'userId du token directement.
  req.userId = token.startsWith("demo_") ? token : `user_${token.slice(0,8)}`;
  if (!usersStore[req.userId]) usersStore[req.userId] = { history:[], favorites:[] };
  next();
}

// ── POST /feedback ────────────────────────────────────────────────────────────
/**
 * Body: { waste_id, correct, suggested_flux?, region, session_id? }
 * Enregistre le retour utilisateur pour améliorer l'IA
 */
router.post("/feedback", (req, res) => {
  const { waste_id, correct, suggested_flux, region, session_id } = req.body;

  if (!waste_id || correct === undefined || !region) {
    return res.status(400).json({
      error:"Required fields: waste_id, correct (boolean), region"
    });
  }

  const entry = {
    id:            `fb_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    waste_id,
    correct:       Boolean(correct),
    suggested_flux:suggested_flux || null,
    region:        region.toLowerCase(),
    session_id:    session_id || null,
    timestamp:     new Date().toISOString(),
  };

  feedbackStore.push(entry);

  // Stats rapides
  const total    = feedbackStore.length;
  const positive = feedbackStore.filter(f => f.correct).length;
  const accuracy = total > 0 ? Math.round((positive / total) * 100) : 0;

  res.json({
    status:  "ok",
    message: { fr:"Merci pour votre retour !", nl:"Bedankt voor uw feedback!", en:"Thank you for your feedback!" },
    feedback_id: entry.id,
    global_accuracy: `${accuracy}% (${positive}/${total} correct)`,
  });
});

// ── GET /feedback/stats (admin) ───────────────────────────────────────────────
router.get("/feedback/stats", (req, res) => {
  const byRegion = {};
  for (const f of feedbackStore) {
    if (!byRegion[f.region]) byRegion[f.region] = { total:0, correct:0 };
    byRegion[f.region].total++;
    if (f.correct) byRegion[f.region].correct++;
  }
  res.json({
    total_feedbacks: feedbackStore.length,
    by_region: byRegion,
    recent: feedbackStore.slice(-10).reverse(),
  });
});

// ── POST /auth/register (demo) ────────────────────────────────────────────────
router.post("/auth/register", (req, res) => {
  const { email, lang, region } = req.body;
  if (!email) return res.status(400).json({ error:"email is required" });

  const userId = `demo_${Buffer.from(email).toString("base64").slice(0,12)}`;
  usersStore[userId] = { history:[], favorites:[], lang:lang||"fr", region:region||"bruxelles", email };

  res.json({
    token:   userId,   // En prod : JWT signé
    user_id: userId,
    message: "Demo token — use as Bearer token in Authorization header",
  });
});

// ── GET /user/history ─────────────────────────────────────────────────────────
router.get("/user/history", requireAuth, (req, res) => {
  const user = usersStore[req.userId];
  res.json({
    user_id: req.userId,
    count:   user.history.length,
    history: user.history.slice().reverse(), // plus récent en premier
  });
});

// ── POST /user/history (enregistrer un tri) ───────────────────────────────────
router.post("/user/history", requireAuth, (req, res) => {
  const { waste_id, flux, region } = req.body;
  if (!waste_id || !flux) return res.status(400).json({ error:"waste_id and flux are required" });

  const entry = { waste_id, flux, region:region||"bruxelles", date: new Date().toISOString() };
  usersStore[req.userId].history.push(entry);

  res.json({ status:"ok", entry, total_history: usersStore[req.userId].history.length });
});

// ── GET /user/favorites ───────────────────────────────────────────────────────
router.get("/user/favorites", requireAuth, (req, res) => {
  const OBJECTS = require("../data/objects");
  const user    = usersStore[req.userId];
  const favs    = user.favorites.map(id => {
    const obj = OBJECTS.find(o => o.id === id);
    return obj ? { id:obj.id, name_fr:obj.fr, name_nl:obj.nl, flux:obj.flux } : { id };
  });
  res.json({ user_id:req.userId, count:favs.length, favorites:favs });
});

// ── POST /user/favorites ──────────────────────────────────────────────────────
router.post("/user/favorites", requireAuth, (req, res) => {
  const { waste_id } = req.body;
  if (!waste_id) return res.status(400).json({ error:"waste_id is required" });

  const user = usersStore[req.userId];
  if (!user.favorites.includes(waste_id)) {
    user.favorites.push(waste_id);
  }
  res.json({ status:"ok", favorites: user.favorites });
});

// ── DELETE /user/favorites/:id ────────────────────────────────────────────────
router.delete("/user/favorites/:id", requireAuth, (req, res) => {
  const user = usersStore[req.userId];
  user.favorites = user.favorites.filter(id => id !== req.params.id);
  res.json({ status:"ok", favorites: user.favorites });
});

module.exports = router;
