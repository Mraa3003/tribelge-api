# ♻️ TriBelge API

API REST Node.js pour le tri sélectif belge — 3 régions, 32 objets, FR/NL/EN.

## 🚀 Installation & démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env et ajoutez votre ANTHROPIC_API_KEY

# 3. Démarrer le serveur
npm start          # production
npm run dev        # développement (avec rechargement automatique)
```

Le serveur démarre sur **http://localhost:3000**

---

## 📡 Endpoints

### 🔍 Classification

#### `POST /classify/photo`
Identifie un déchet via photo et retourne la poubelle correcte.

```bash
curl -X POST http://localhost:3000/classify/photo \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "<base64 de votre image JPEG>",
    "region": "bruxelles",
    "lang": "fr",
    "commune": "Ixelles"
  }'
```

**Réponse :**
```json
{
  "waste_id": "canette",
  "name": "Canette boisson",
  "flux": "PMC",
  "container": "Sac bleu",
  "reason": "Emballage PMC → sac bleu (vider avant tri)",
  "confidence": 0.92,
  "notes": "Vider, écraser optionnel",
  "alternatives": [...]
}
```

---

#### `POST /classify/barcode`
Identifie un produit par code-barres (Open Food Facts).

```bash
curl -X POST http://localhost:3000/classify/barcode \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "5000112637922",
    "region": "flandre",
    "lang": "nl"
  }'
```

---

### 📦 Objets

#### `GET /objects`
Liste les 32 objets du catalogue.

```bash
# Tous les objets
curl http://localhost:3000/objects?lang=fr

# Filtrer par flux
curl http://localhost:3000/objects?flux=PMC&lang=nl

# Filtrer les dangereux
curl http://localhost:3000/objects?hazardous=true

# Filtrer l'électronique
curl http://localhost:3000/objects?electronics=true
```

#### `GET /objects/:id`
Détail complet d'un objet avec règles par région.

```bash
curl http://localhost:3000/objects/canette?lang=fr
```

**Réponse :**
```json
{
  "id": "canette",
  "name": "Canette boisson",
  "flux": "PMC",
  "material": "metal",
  "is_packaging": true,
  "hazardous": false,
  "electronics": false,
  "notes": "Vider, écraser optionnel",
  "rules_by_region": {
    "bruxelles": { "flux": "PMC", "container": "Sac bleu" },
    "flandre":   { "flux": "PMC", "container": "Gele zak" },
    "wallonie":  { "flux": "PMC", "container": "Sac jaune" }
  }
}
```

---

### 📋 Règles

#### `GET /rules/:region`
Toutes les règles d'une région.

```bash
curl http://localhost:3000/rules/bruxelles?lang=fr
curl http://localhost:3000/rules/flandre?lang=nl
curl http://localhost:3000/rules/wallonie?lang=en
```

#### `GET /rules/:region/:flux`
Règles d'un flux précis.

```bash
curl http://localhost:3000/rules/bruxelles/PMC?lang=fr
curl http://localhost:3000/rules/flandre/Dangereux?lang=nl
```

---

### 🗺️ Communes & Recyparks

#### `GET /communes/:region`
```bash
curl http://localhost:3000/communes/bruxelles
curl http://localhost:3000/communes/flandre?search=Gent
curl http://localhost:3000/communes/wallonie
```

#### `GET /recyparks`
```bash
# Par région
curl http://localhost:3000/recyparks?region=bruxelles

# Par proximité GPS (rayon 5km)
curl "http://localhost:3000/recyparks?lat=50.85&lng=4.35&radius=5000"
```

---

### 👤 Utilisateurs

#### `POST /auth/register`
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mail.com","lang":"fr","region":"bruxelles"}'
# → retourne { "token": "demo_xxx..." }
```

#### `GET /user/history` (Auth requis)
```bash
curl http://localhost:3000/user/history \
  -H "Authorization: Bearer demo_xxx..."
```

#### `POST /user/favorites` (Auth requis)
```bash
curl -X POST http://localhost:3000/user/favorites \
  -H "Authorization: Bearer demo_xxx..." \
  -H "Content-Type: application/json" \
  -d '{"waste_id":"pile"}'
```

---

### 💬 Feedback

#### `POST /feedback`
```bash
curl -X POST http://localhost:3000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "waste_id": "canette",
    "correct": false,
    "suggested_flux": "Papier",
    "region": "bruxelles"
  }'
```

#### `GET /feedback/stats`
```bash
curl http://localhost:3000/feedback/stats
```

---

## 🏗️ Structure du projet

```
tribelge-api/
├── src/
│   ├── index.js              # Serveur Express principal
│   ├── data/
│   │   ├── objects.js        # 32 objets (fr/nl/en + règles)
│   │   ├── rules.js          # Règles par région (BXL/FLA/WAL)
│   │   └── communes.js       # 50+ communes des 3 régions
│   ├── middleware/
│   │   └── rulesEngine.js    # Moteur de règles (objet → flux)
│   └── routes/
│       ├── classify.js       # /classify/photo + /classify/barcode
│       ├── data.js           # /objects, /rules, /communes, /recyparks
│       └── user.js           # /feedback, /auth, /user/*
├── .env.example              # Variables d'environnement
├── package.json
└── README.md
```

---

## 🔧 Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Oui | Clé API pour `/classify/photo` |
| `PORT` | Non | Port du serveur (défaut: 3000) |
| `ALLOWED_ORIGINS` | Non | CORS origins (défaut: *) |
| `NODE_ENV` | Non | `development` ou `production` |

---

## 🗺️ Roadmap technique

- [ ] **Base de données** : Remplacer les stores en mémoire par PostgreSQL/MongoDB
- [ ] **JWT réel** : Remplacer le token démo par jsonwebtoken
- [ ] **Barcode DB locale** : Cache des produits Open Food Facts
- [ ] **Recyparks géo** : Vraie base géospatiale (PostGIS ou MongoDB geo)
- [ ] **Tests** : Jest + Supertest
- [ ] **Docker** : Dockerfile + docker-compose
- [ ] **Deploy** : Railway, Render, ou AWS Lambda

---

## 🇧🇪 Régions supportées

| Région | PMC | Papier | Organique |
|---|---|---|---|
| Bruxelles-Capitale | Sac **bleu** | Sac **blanc** | Sac **orange** |
| Flandre | Sac **jaune** | Sac **bleu** | Container **brun** (GFT) |
| Wallonie | Sac **jaune** | Sac **blanc** | Sac **orange/brun** |

---

*TriBelge API v1.0.0 — Made in 🇧🇪*
