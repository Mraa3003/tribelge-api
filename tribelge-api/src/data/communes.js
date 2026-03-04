// TriBelge — Communes des 3 régions belges

const COMMUNES = {
  bruxelles: [
    { name:"Anderlecht",             intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Collecte sac orange organique" },
    { name:"Auderghem",              intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Berchem-Sainte-Agathe", intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Bruxelles-Ville",        intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Collecte porte-à-porte dense" },
    { name:"Etterbeek",              intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Evere",                  intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Forest",                 intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Ganshoren",              intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Ixelles",                intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Forte densité, collecte fréquente" },
    { name:"Jette",                  intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Koekelberg",             intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Molenbeek-Saint-Jean",   intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Saint-Gilles",           intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Saint-Josse-ten-Noode",  intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Commune la plus dense de Belgique" },
    { name:"Schaerbeek",             intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Uccle",                  intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Zone résidentielle, GFT actif" },
    { name:"Watermael-Boitsfort",    intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Zone verte, GFT actif" },
    { name:"Woluwe-Saint-Lambert",   intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Woluwe-Saint-Pierre",    intercommunale:"Bruxelles-Propreté", pmc:"Sac bleu", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
  ],

  flandre: [
    { name:"Anvers",        province:"Anvers",        intercommunale:"IGEAN / Indaver",  pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Gand",          province:"Flandre-Orient.",intercommunale:"IVAGO",            pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Bruges",        province:"Flandre-Occid.", intercommunale:"IVBO",            pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Louvain",       province:"Brabant flam.", intercommunale:"Interleuven",      pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Hasselt",       province:"Limbourg",      intercommunale:"LIMBURG.NET",      pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Malines",       province:"Anvers",        intercommunale:"IGEAN",            pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Aalst",         province:"Flandre-Orient.",intercommunale:"Tiber",           pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Roulers",       province:"Flandre-Occid.", intercommunale:"MIROM",           pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Saint-Nicolas", province:"Flandre-Orient.",intercommunale:"Miwa",            pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Courtrai",      province:"Flandre-Occid.", intercommunale:"IMOG",            pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Turnhout",      province:"Anvers",        intercommunale:"IGEAN",            pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
    { name:"Genk",          province:"Limbourg",      intercommunale:"LIMBURG.NET",      pmc:"Gele zak", papier:"Blauwe zak", verre:"Glascontainer", specificities:"GFT bruine container" },
  ],

  wallonie: [
    { name:"Liège",          province:"Liège",        intercommunale:"Intradel",         pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Sac brun pour organiques" },
    { name:"Namur",          province:"Namur",        intercommunale:"BEP Environnement",pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Sac orange pour organiques" },
    { name:"Charleroi",      province:"Hainaut",      intercommunale:"TIBI",             pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Sac brun pour organiques" },
    { name:"Mons",           province:"Hainaut",      intercommunale:"IPALLE",           pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Sac vert pour organiques" },
    { name:"Arlon",          province:"Luxembourg",   intercommunale:"IDELUX",           pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Zone rurale, Recypark fréquent" },
    { name:"Tournai",        province:"Hainaut",      intercommunale:"IPALLE",           pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Verviers",       province:"Liège",        intercommunale:"Intradel",         pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Wavre",          province:"Brabant wallon",intercommunale:"ICDI",            pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"La Louvière",    province:"Hainaut",      intercommunale:"TIBI",             pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Mouscron",       province:"Hainaut",      intercommunale:"IPALLE",           pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
    { name:"Ottignies-LLN",  province:"Brabant wallon",intercommunale:"ICDI",            pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"Zone universitaire" },
    { name:"Seraing",        province:"Liège",        intercommunale:"Intradel",         pmc:"Sac jaune", papier:"Sac blanc", verre:"Conteneur verre", specificities:"" },
  ],
};

module.exports = COMMUNES;
