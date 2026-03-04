// TriBelge — Règles de tri par région + contenants par commune

const RULES = {
  bruxelles: {
    name: { fr:"Bruxelles-Capitale", nl:"Brussels Hoofdstedelijk Gewest", en:"Brussels-Capital Region" },
    bins: {
      PMC:          { fr:"Sac bleu",             nl:"Blauwe zak",                  en:"Blue bag" },
      Papier:       { fr:"Sac blanc",            nl:"Witte zak",                   en:"White bag" },
      Verre:        { fr:"Conteneur à verre",    nl:"Glascontainer",               en:"Glass container" },
      Organique:    { fr:"Sac orange",           nl:"Oranje zak",                  en:"Orange bag" },
      Résiduels:    { fr:"Sac noir",             nl:"Zwarte zak",                  en:"Black bag" },
      Dangereux:    { fr:"Point collecte / Recypark", nl:"Verzamelpunt / Recyclagepark", en:"Collection point / Recypark" },
      Électronique: { fr:"Recypark / Magasin",   nl:"Recyclagepark / Winkel",      en:"Recypark / Shop" },
    },
    // Moteur de règles — priorité décroissante (1 = plus haute)
    rules: [
      { priority:1, condition:"hazardous === true",                                        flux:"Dangereux",    reason:{ fr:"Déchet dangereux — ne jamais mélanger avec les autres", nl:"Gevaarlijk afval — nooit mengen", en:"Hazardous waste — never mix with others" } },
      { priority:2, condition:"electronics === true",                                       flux:"Électronique", reason:{ fr:"DEEE — dépôt au Recypark ou reprise en magasin",         nl:"AEEA — inleveren op recyclagepark of in winkel", en:"WEEE — drop at Recypark or take-back at shop" } },
      { priority:3, condition:"material === 'verre'",                                       flux:"Verre",        reason:{ fr:"Verre → conteneur à verre (séparer blanc/coloré)",        nl:"Glas → glascontainer (wit/gekleurd scheiden)", en:"Glass → glass container (separate clear/coloured)" } },
      { priority:4, condition:"material === 'organique'",                                   flux:"Organique",    reason:{ fr:"Déchet organique → sac orange",                           nl:"Organisch afval → oranje zak", en:"Organic waste → orange bag" } },
      { priority:5, condition:"is_packaging === true && ['plastique','metal','carton'].includes(material)", flux:"PMC", reason:{ fr:"Emballage PMC → sac bleu (vider avant tri)",  nl:"PMC-verpakking → blauwe zak (eerst leegmaken)", en:"PMC packaging → blue bag (empty before sorting)" } },
      { priority:6, condition:"['papier','carton'].includes(material)",                      flux:"Papier",       reason:{ fr:"Papier/Carton → sac blanc (sec et propre)",               nl:"Papier/Karton → witte zak (droog en schoon)", en:"Paper/Cardboard → white bag (dry and clean)" } },
      { priority:7, condition:"true",                                                        flux:"Résiduels",    reason:{ fr:"Déchet résiduel → sac noir",                              nl:"Restafval → zwarte zak", en:"Residual waste → black bag" } },
    ],
    accepted: {
      PMC:       { fr:["Bouteilles/flacons plastique","Canettes","Boîtes de conserve","Briques à boisson","Aérosols vides","Barquettes plastique"], en:["Plastic bottles/containers","Cans","Tins","Beverage cartons","Empty aerosols","Plastic trays"] },
      Papier:    { fr:["Journaux","Magazines","Cartons aplatis","Sacs papier","Enveloppes"], en:["Newspapers","Magazines","Flattened cardboard","Paper bags","Envelopes"] },
      Verre:     { fr:["Bouteilles verre","Bocaux","Pots de confiture"], en:["Glass bottles","Jars","Jam jars"] },
      Résiduels: { fr:["Film plastique souple","Couches","Mégots","Céramique cassée","Sachets chips"], en:["Soft plastic film","Nappies","Cigarette butts","Broken ceramics","Crisp packets"] },
    },
    refused: {
      PMC:    { fr:["Film plastique souple","Sacs plastique","Polystyrène","Emballages sales"], en:["Soft plastic film","Plastic bags","Polystyrene","Dirty packaging"] },
      Papier: { fr:["Papier gras/souillé","Papier photo","Papier aluminium","Mouchoirs usagés"], en:["Greasy/soiled paper","Photo paper","Aluminium foil","Used tissues"] },
      Verre:  { fr:["Verre à vitre","Miroirs","Vaisselle","Ampoules","Vitrocéramique"], en:["Window glass","Mirrors","Crockery","Light bulbs","Glass-ceramic"] },
    },
  },

  flandre: {
    name: { fr:"Flandre", nl:"Vlaanderen", en:"Flanders" },
    bins: {
      PMC:          { fr:"Sac jaune",            nl:"Gele zak",                    en:"Yellow bag" },
      Papier:       { fr:"Sac bleu",             nl:"Blauwe zak",                  en:"Blue bag" },
      Verre:        { fr:"Conteneur à verre",    nl:"Glascontainer",               en:"Glass container" },
      Organique:    { fr:"Conteneur brun (GFT)", nl:"Bruine container (GFT)",      en:"Brown container (GFT)" },
      Résiduels:    { fr:"Sac gris",             nl:"Grijze zak",                  en:"Grey bag" },
      Dangereux:    { fr:"Recyclagepark",        nl:"Recyclagepark",               en:"Recycling park" },
      Électronique: { fr:"Recyclagepark / Magasin", nl:"Recyclagepark / Winkel",   en:"Recycling park / Shop" },
    },
    rules: [
      { priority:1, condition:"hazardous === true",                                        flux:"Dangereux",    reason:{ fr:"Déchet dangereux → Recyclagepark",                        nl:"Gevaarlijk afval → Recyclagepark", en:"Hazardous waste → Recycling park" } },
      { priority:2, condition:"electronics === true",                                       flux:"Électronique", reason:{ fr:"DEEE → Recyclagepark ou reprise magasin",                 nl:"AEEA → Recyclagepark of winkelretour", en:"WEEE → Recycling park or shop take-back" } },
      { priority:3, condition:"material === 'verre'",                                       flux:"Verre",        reason:{ fr:"Verre → glascontainer",                                   nl:"Glas → glascontainer", en:"Glass → glass container" } },
      { priority:4, condition:"material === 'organique'",                                   flux:"Organique",    reason:{ fr:"GFT → conteneur brun",                                    nl:"GFT → bruine container", en:"GFT organic → brown container" } },
      { priority:5, condition:"is_packaging === true && ['plastique','metal','carton'].includes(material)", flux:"PMC", reason:{ fr:"Emballage PMC → sac jaune",                nl:"PMC-verpakking → gele zak", en:"PMC packaging → yellow bag" } },
      { priority:6, condition:"['papier','carton'].includes(material)",                      flux:"Papier",       reason:{ fr:"Papier/Carton → sac bleu",                                nl:"Papier/Karton → blauwe zak", en:"Paper/Cardboard → blue bag" } },
      { priority:7, condition:"true",                                                        flux:"Résiduels",    reason:{ fr:"Déchet résiduel → sac gris",                              nl:"Restafval → grijze zak", en:"Residual waste → grey bag" } },
    ],
    accepted: {
      PMC:      { fr:["Bouteilles plastique","Canettes","Briques à boisson","Barquettes (depuis 2023)"], en:["Plastic bottles","Cans","Beverage cartons","Trays (since 2023)"] },
      Papier:   { fr:["Journaux","Magazines","Cartons aplatis"], en:["Newspapers","Magazines","Flattened cardboard"] },
      Organique:{ fr:["Épluchures","Restes alimentaires","Gazon","Feuilles (GFT)"], en:["Peels","Food scraps","Lawn","Leaves (GFT)"] },
    },
    refused: {
      PMC:    { fr:["Film plastique souple","Sacs","Polystyrène"], en:["Soft plastic film","Bags","Polystyrene"] },
      Papier: { fr:["Papier gras","Papier photo","Papier alu"], en:["Greasy paper","Photo paper","Aluminium foil"] },
    },
  },

  wallonie: {
    name: { fr:"Wallonie", nl:"Wallonië", en:"Wallonia" },
    bins: {
      PMC:          { fr:"Sac jaune",            nl:"Gele zak",                    en:"Yellow bag" },
      Papier:       { fr:"Sac blanc",            nl:"Witte zak",                   en:"White bag" },
      Verre:        { fr:"Conteneur à verre",    nl:"Glascontainer",               en:"Glass container" },
      Organique:    { fr:"Sac orange/brun (Bio)",nl:"Oranje/bruine zak (Bio)",     en:"Orange/brown bag (Bio)" },
      Résiduels:    { fr:"Sac gris",             nl:"Grijze zak",                  en:"Grey bag" },
      Dangereux:    { fr:"Recypark / Point collecte", nl:"Recyclagepark / Verzamelpunt", en:"Recypark / Collection point" },
      Électronique: { fr:"Recypark",             nl:"Recyclagepark",               en:"Recypark" },
    },
    rules: [
      { priority:1, condition:"hazardous === true",                                        flux:"Dangereux",    reason:{ fr:"Déchet dangereux → Recypark",                             nl:"Gevaarlijk afval → Recypark", en:"Hazardous waste → Recypark" } },
      { priority:2, condition:"electronics === true",                                       flux:"Électronique", reason:{ fr:"DEEE → Recypark",                                         nl:"AEEA → Recypark", en:"WEEE → Recypark" } },
      { priority:3, condition:"material === 'verre'",                                       flux:"Verre",        reason:{ fr:"Verre → conteneur à verre",                               nl:"Glas → glascontainer", en:"Glass → glass container" } },
      { priority:4, condition:"is_packaging === true && ['plastique','metal','carton'].includes(material)", flux:"PMC", reason:{ fr:"Emballage PMC → sac jaune",                nl:"PMC-verpakking → gele zak", en:"PMC packaging → yellow bag" } },
      { priority:5, condition:"['papier','carton'].includes(material)",                      flux:"Papier",       reason:{ fr:"Papier/Carton → sac blanc",                               nl:"Papier/Karton → witte zak", en:"Paper/Cardboard → white bag" } },
      { priority:6, condition:"material === 'organique'",                                   flux:"Organique",    reason:{ fr:"Déchet organique → sac orange/brun (variable/commune)",   nl:"Organisch afval → oranje/bruine zak", en:"Organic → orange/brown bag (varies by municipality)" } },
      { priority:7, condition:"true",                                                        flux:"Résiduels",    reason:{ fr:"Déchet résiduel → sac gris",                              nl:"Restafval → grijze zak", en:"Residual waste → grey bag" } },
    ],
    accepted: {
      PMC:    { fr:["Bouteilles plastique","Canettes","Briques à boisson","Boîtes conserve"], en:["Plastic bottles","Cans","Beverage cartons","Tins"] },
      Papier: { fr:["Journaux","Magazines","Cartons aplatis","Enveloppes"], en:["Newspapers","Magazines","Flattened cardboard","Envelopes"] },
    },
    refused: {
      PMC:    { fr:["Film plastique","Sacs","Polystyrène"], en:["Plastic film","Bags","Polystyrene"] },
      Papier: { fr:["Papier gras","Essuie-tout usagé"], en:["Greasy paper","Used kitchen paper"] },
    },
  },
};

module.exports = RULES;
