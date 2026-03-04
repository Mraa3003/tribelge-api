// TriBelge — Route POST /classify/photo  &  POST /classify/barcode
const express = require("express");
const router  = express.Router();
const OBJECTS = require("../data/objects");
const RULES   = require("../data/rules");
const { classifyObject, getLocalContainer } = require("../middleware/rulesEngine");

// ── Helpers ──────────────────────────────────────────────────────────────────
const VALID_REGIONS = ["bruxelles","flandre","wallonie"];
const VALID_LANGS   = ["fr","nl","en"];

function validateRegionLang(req, res) {
  const region = (req.body.region || req.query.region || "bruxelles").toLowerCase();
  const lang   = (req.body.lang   || req.query.lang   || "fr").toLowerCase();
  if (!VALID_REGIONS.includes(region)) {
    res.status(400).json({ error:`Invalid region. Use: ${VALID_REGIONS.join("|")}` });
    return null;
  }
  if (!VALID_LANGS.includes(lang)) {
    res.status(400).json({ error:`Invalid lang. Use: ${VALID_LANGS.join("|")}` });
    return null;
  }
  return { region, lang };
}

function buildResult(obj, region, lang, commune, confidence, source) {
  const classification = classifyObject(obj, region, lang);
  const localContainer = getLocalContainer(classification.flux, commune, region, lang);

  const regionData = RULES[region];
  const accepted = regionData?.accepted?.[classification.flux]?.[lang]
                || regionData?.accepted?.[classification.flux]?.fr
                || [];
  const refused  = regionData?.refused?.[classification.flux]?.[lang]
                || regionData?.refused?.[classification.flux]?.fr
                || [];

  return {
    waste_id:       obj.id,
    name:           obj[lang] || obj.fr,
    flux:           classification.flux,
    container:      localContainer || classification.container,
    container_local:localContainer || null,
    reason:         classification.reason,
    confidence:     confidence,
    source:         source,
    notes:          obj.notes || "",
    accepted_items: accepted,
    refused_items:  refused,
    region:         region,
    lang:           lang,
  };
}

// ── POST /classify/photo ─────────────────────────────────────────────────────
/**
 * Body: { image_base64: string, region: string, lang: string, commune?: string }
 * Détecte l'objet via l'IA Claude Vision, puis applique les règles locales.
 */
router.post("/photo", async (req, res) => {
  try {
    const rl = validateRegionLang(req, res); if (!rl) return;
    const { region, lang } = rl;
    const { image_base64, commune } = req.body;

    if (!image_base64) {
      return res.status(400).json({ error:"image_base64 is required" });
    }

    // Appel API Anthropic Claude Vision
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error:"ANTHROPIC_API_KEY not configured" });
    }

    const regionName = RULES[region]?.name?.[lang] || region;
    const objectIds  = OBJECTS.map(o => o.id).join(", ");

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-opus-4-5",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:image_base64 } },
            { type:"text",  text:`You are a Belgian waste sorting expert for ${regionName}.
Identify the waste item in the image. Respond ONLY in valid JSON (no backticks, no markdown):
{
  "waste_id": "best matching id from: ${objectIds}",
  "detected_name": "short name of the detected item",
  "confidence": 0.0 to 1.0,
  "alternatives": ["other_possible_id_1", "other_possible_id_2"]
}
If unsure, still pick the closest match and lower the confidence score.` }
          ]
        }]
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.content?.map(b => b.text || "").join("") || "{}";
    const aiResult = JSON.parse(aiText.trim());

    // Trouver l'objet dans la DB
    const obj = OBJECTS.find(o => o.id === aiResult.waste_id) || OBJECTS[0];

    // Construire les alternatives
    const alternatives = (aiResult.alternatives || [])
      .map(id => OBJECTS.find(o => o.id === id))
      .filter(Boolean)
      .map(o => ({
        waste_id:  o.id,
        name:      o[lang] || o.fr,
        flux:      classifyObject(o, region, lang).flux,
        container: classifyObject(o, region, lang).container,
      }));

    const result = buildResult(obj, region, lang, commune, aiResult.confidence || 0.8, "ai_vision");
    result.detected_name = aiResult.detected_name || obj[lang] || obj.fr;
    result.alternatives  = alternatives;

    res.json(result);

  } catch (err) {
    console.error("[/classify/photo]", err.message);
    res.status(500).json({ error:"Classification failed", details: err.message });
  }
});

// ── POST /classify/barcode ────────────────────────────────────────────────────
/**
 * Body: { barcode: string, region: string, lang: string, commune?: string }
 * Identifie le produit par code-barres (Open Food Facts) puis applique les règles.
 */
router.post("/barcode", async (req, res) => {
  try {
    const rl = validateRegionLang(req, res); if (!rl) return;
    const { region, lang } = rl;
    const { barcode, commune } = req.body;

    if (!barcode) {
      return res.status(400).json({ error:"barcode is required" });
    }

    // Interroger Open Food Facts (API publique, sans clé)
    const offRes = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const offData = await offRes.json();

    if (offData.status !== 1 || !offData.product) {
      return res.status(404).json({
        error:   "Product not found in barcode database",
        barcode: barcode,
        suggestion: "Try POST /classify/photo instead",
      });
    }

    const product  = offData.product;
    const packaging = (product.packaging_tags || []).join(",").toLowerCase();

    // Détecter le matériau principal depuis l'emballage Open Food Facts
    let material = "composite";
    if (packaging.includes("plastic") || packaging.includes("plastique")) material = "plastique";
    else if (packaging.includes("glass") || packaging.includes("verre"))   material = "verre";
    else if (packaging.includes("metal") || packaging.includes("aluminium") || packaging.includes("steel")) material = "metal";
    else if (packaging.includes("cardboard") || packaging.includes("carton")) material = "carton";
    else if (packaging.includes("paper") || packaging.includes("papier"))  material = "papier";

    // Objet synthétique basé sur le produit scanné
    const syntheticObj = {
      id:          `barcode_${barcode}`,
      fr:          product.product_name_fr || product.product_name || `Produit ${barcode}`,
      nl:          product.product_name_nl || product.product_name || `Product ${barcode}`,
      en:          product.product_name_en || product.product_name || `Product ${barcode}`,
      is_packaging:true,
      hazardous:   false,
      electronics: false,
      material:    material,
      flux:        "PMC",
      notes:       `Emballage: ${product.packaging || "non renseigné"}`,
    };

    const result = buildResult(syntheticObj, region, lang, commune, 0.95, "barcode_openfoodfacts");
    result.product_name   = syntheticObj[lang] || syntheticObj.fr;
    result.product_brand  = product.brands || "";
    result.barcode        = barcode;
    result.packaging_tags = product.packaging_tags || [];

    res.json(result);

  } catch (err) {
    console.error("[/classify/barcode]", err.message);
    res.status(500).json({ error:"Barcode classification failed", details: err.message });
  }
});

module.exports = router;
