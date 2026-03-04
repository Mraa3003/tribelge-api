// TriBelge — Moteur de règles : objet → flux de tri
const RULES = require("../data/rules");

/**
 * Applique les règles par priorité et retourne le flux correct
 * @param {object} obj  — objet du catalogue (ou propriétés détectées par IA)
 * @param {string} region — "bruxelles" | "flandre" | "wallonie"
 * @param {string} lang   — "fr" | "nl" | "en"
 */
function classifyObject(obj, region, lang = "fr") {
  const regionRules = RULES[region];
  if (!regionRules) throw new Error(`Unknown region: ${region}`);

  // Trier par priorité croissante
  const sorted = [...regionRules.rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    try {
      // Évaluation sécurisée de la condition
      const fn = new Function(
        "is_packaging","hazardous","electronics","material","flux",
        `return ${rule.condition}`
      );
      const match = fn(
        obj.is_packaging,
        obj.hazardous,
        obj.electronics,
        obj.material,
        obj.flux
      );
      if (match) {
        const bin = regionRules.bins[rule.flux];
        return {
          flux: rule.flux,
          container: bin ? (bin[lang] || bin.fr) : rule.flux,
          reason: rule.reason ? (rule.reason[lang] || rule.reason.fr) : "",
          rule_priority: rule.priority,
        };
      }
    } catch (e) {
      // Ignorer les erreurs d'évaluation et passer à la règle suivante
      continue;
    }
  }

  // Fallback absolu
  const fallbackBin = regionRules.bins["Résiduels"];
  return {
    flux: "Résiduels",
    container: fallbackBin ? (fallbackBin[lang] || fallbackBin.fr) : "Sac résiduel",
    reason: "Aucune règle spécifique — déchet résiduel",
    rule_priority: 99,
  };
}

/**
 * Retourne le contenant localisé pour une commune spécifique (si disponible)
 */
function getLocalContainer(flux, commune, region, lang = "fr") {
  const COMMUNES = require("../data/communes");
  const communes = COMMUNES[region] || [];
  const found = communes.find(c =>
    c.name.toLowerCase() === (commune || "").toLowerCase()
  );
  if (!found) return null;

  const map = { PMC: "pmc", Papier: "papier", Verre: "verre" };
  const key = map[flux];
  return key ? found[key] : null;
}

module.exports = { classifyObject, getLocalContainer };
