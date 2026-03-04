// TriBelge — Routes GET /objects, /rules, /communes, /recyparks
const express = require("express");
const router  = express.Router();
const OBJECTS = require("../data/objects");
const RULES   = require("../data/rules");
const COMMUNES = require("../data/communes");

const VALID_REGIONS = ["bruxelles","flandre","wallonie"];
const VALID_LANGS   = ["fr","nl","en"];
const VALID_FLUX    = ["PMC","Papier","Verre","Organique","Résiduels","Dangereux","Électronique"];

function getLang(req)   { const l = req.query.lang   || "fr"; return VALID_LANGS.includes(l)   ? l : "fr"; }
function getRegion(req) { const r = req.params.region || req.query.region || "bruxelles"; return r.toLowerCase(); }

// ── GET /objects ─────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const lang     = getLang(req);
  const { flux, material, hazardous, electronics } = req.query;

  let results = OBJECTS;

  if (flux)        results = results.filter(o => o.flux === flux);
  if (material)    results = results.filter(o => o.material === material);
  if (hazardous !== undefined) results = results.filter(o => o.hazardous  === (hazardous  === "true"));
  if (electronics !== undefined) results = results.filter(o => o.electronics === (electronics === "true"));

  const out = results.map(o => ({
    id:          o.id,
    name:        o[lang] || o.fr,
    flux:        o.flux,
    material:    o.material,
    is_packaging:o.is_packaging,
    hazardous:   o.hazardous,
    electronics: o.electronics,
    confidence:  o.confidence,
  }));

  res.json({ count: out.length, lang, objects: out });
});

// ── GET /objects/:id ──────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const lang = getLang(req);
  const obj  = OBJECTS.find(o => o.id === req.params.id);
  if (!obj) return res.status(404).json({ error:`Object '${req.params.id}' not found` });

  const rules = {};
  for (const region of VALID_REGIONS) {
    const { classifyObject } = require("../middleware/rulesEngine");
    const r = classifyObject(obj, region, lang);
    rules[region] = { flux: r.flux, container: r.container, reason: r.reason };
  }

  res.json({
    id:          obj.id,
    name:        obj[lang] || obj.fr,
    name_fr:     obj.fr,
    name_nl:     obj.nl,
    name_en:     obj.en,
    flux:        obj.flux,
    material:    obj.material,
    is_packaging:obj.is_packaging,
    hazardous:   obj.hazardous,
    electronics: obj.electronics,
    notes:       obj.notes,
    confidence:  obj.confidence,
    rules_by_region: rules,
  });
});

// ── GET /rules/:region ────────────────────────────────────────────────────────
router.get("/rules/:region", (req, res) => {
  const lang   = getLang(req);
  const region = getRegion(req);

  if (!VALID_REGIONS.includes(region)) {
    return res.status(400).json({ error:`Invalid region. Use: ${VALID_REGIONS.join("|")}` });
  }

  const data = RULES[region];
  const bins = {};
  for (const [flux, bin] of Object.entries(data.bins)) {
    bins[flux] = bin[lang] || bin.fr;
  }

  res.json({
    region,
    name:  data.name[lang] || data.name.fr,
    lang,
    bins,
    rules: data.rules.map(r => ({
      priority:  r.priority,
      condition: r.condition,
      flux:      r.flux,
      container: bins[r.flux] || r.flux,
      reason:    r.reason ? (r.reason[lang] || r.reason.fr) : "",
    })),
    accepted: data.accepted || {},
    refused:  data.refused  || {},
  });
});

// ── GET /rules/:region/:flux ──────────────────────────────────────────────────
router.get("/rules/:region/:flux", (req, res) => {
  const lang   = getLang(req);
  const region = req.params.region.toLowerCase();
  const flux   = req.params.flux;

  if (!VALID_REGIONS.includes(region)) {
    return res.status(400).json({ error:`Invalid region` });
  }

  const data = RULES[region];
  const bin  = data.bins[flux];
  if (!bin) {
    return res.status(404).json({ error:`Flux '${flux}' not found. Valid: ${Object.keys(data.bins).join("|")}` });
  }

  const rule = data.rules.find(r => r.flux === flux);
  res.json({
    region,
    flux,
    container:     bin[lang] || bin.fr,
    condition:     rule?.condition || "",
    reason:        rule?.reason ? (rule.reason[lang] || rule.reason.fr) : "",
    accepted_items:data.accepted?.[flux]?.[lang] || data.accepted?.[flux]?.fr || [],
    refused_items: data.refused?.[flux]?.[lang]  || data.refused?.[flux]?.fr  || [],
  });
});

// ── GET /communes/:region ─────────────────────────────────────────────────────
router.get("/communes/:region", (req, res) => {
  const region = req.params.region.toLowerCase();
  if (!VALID_REGIONS.includes(region)) {
    return res.status(400).json({ error:`Invalid region. Use: ${VALID_REGIONS.join("|")}` });
  }
  const list = COMMUNES[region] || [];
  const search = (req.query.search || "").toLowerCase();
  const filtered = search
    ? list.filter(c => c.name.toLowerCase().includes(search))
    : list;

  res.json({ region, count: filtered.length, communes: filtered });
});

// ── GET /recyparks ────────────────────────────────────────────────────────────
// Données statiques de démonstration — à remplacer par une vraie DB géospatiale
const RECYPARKS = [
  { id:"rp_bxl_forest",     name:"Recypark Forest",          region:"bruxelles", address:"Rue du Viaduc 98, 1190 Forest",          lat:50.8144, lng:4.3325, accepted:["Électronique","Dangereux","Encombrants","Verre"] },
  { id:"rp_bxl_neder",      name:"Recypark Neder-Over-Heembeek",region:"bruxelles",address:"Chaussée Romaine 469, 1120 Bruxelles",  lat:50.8973, lng:4.3714, accepted:["Électronique","Dangereux","Encombrants","PMC","Verre"] },
  { id:"rp_bxl_anderlecht", name:"Recypark Anderlecht",      region:"bruxelles", address:"Rue de la Roue 1, 1070 Anderlecht",       lat:50.8378, lng:4.3012, accepted:["Électronique","Dangereux","Encombrants"] },
  { id:"rp_fla_gent",       name:"Recyclagepark Gent-Noord", region:"flandre",   address:"Bourgoyen 44, 9000 Gent",                 lat:51.0717, lng:3.6950, accepted:["Électronique","Dangereux","GFT","Encombrants"] },
  { id:"rp_fla_antwerp",    name:"Recyclagepark Antwerpen",  region:"flandre",   address:"Smallandlaan 4, 2660 Antwerpen",          lat:51.2194, lng:4.3810, accepted:["Électronique","Dangereux","Encombrants","GFT"] },
  { id:"rp_wal_liege",      name:"Recypark Intradel Liège",  region:"wallonie",  address:"Rue Fond des Tawes 99, 4020 Liège",       lat:50.6159, lng:5.6128, accepted:["Électronique","Dangereux","Encombrants","Verre"] },
  { id:"rp_wal_namur",      name:"Recypark BEP Namur",       region:"wallonie",  address:"Chaussée de Liège 140, 5100 Namur",       lat:50.4780, lng:4.8820, accepted:["Électronique","Dangereux","Encombrants"] },
];

router.get("/recyparks", (req, res) => {
  const region = (req.query.region || "").toLowerCase();
  const lat    = parseFloat(req.query.lat);
  const lng    = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius) || 10000; // mètres

  let results = region ? RECYPARKS.filter(r => r.region === region) : RECYPARKS;

  // Tri par distance si coordonnées fournies
  if (!isNaN(lat) && !isNaN(lng)) {
    results = results
      .map(r => {
        const dLat = (r.lat - lat) * Math.PI / 180;
        const dLng = (r.lng - lng) * Math.PI / 180;
        const a    = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180) * Math.cos(r.lat*Math.PI/180) * Math.sin(dLng/2)**2;
        const dist = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return { ...r, distance_m: Math.round(dist) };
      })
      .filter(r => r.distance_m <= radius)
      .sort((a, b) => a.distance_m - b.distance_m);
  }

  res.json({ count: results.length, recyparks: results });
});

module.exports = router;
