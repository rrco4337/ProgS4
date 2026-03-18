# 🐔 Système de Gestion des Lots de Poulets

## 📋 Vue d'ensemble

Ce système permet de gérer des lots de poulets avec calcul automatique de leur croissance basé sur des modèles de croissance prédéfinis par race.

## 🎯 Concepts clés

### Les Lots
Un **lot** = groupe de poulets identiques qui ont :
- La même **date d'entrée**
- La même **race**
- Le même **âge** (en semaines)

### Les Races
Chaque poulet appartient à une **race** qui possède :
- Un **nom** (ex: Race R1, R2, R3)
- Un **modèle de croissance** spécifique
- Des informations économiques (prix nourriture, prix de vente, etc.)

### Le Modèle de Croissance

Chaque race a un modèle qui définit, pour chaque semaine :
- Le **gain de poids** (en grammes)
- La **quantité de nourriture** consommée (en grammes)

## 📊 Exemple Concret : Race R1

| Semaine | Poids | Nourriture |
|---------|-------|------------|
| 0 | 150 g | 0 g |
| 1 | +30 g | 60 g |
| 2 | +40 g | 60 g |

### Calcul du poids cumulé :

**Semaine 0** : poussin = 150 g

**Semaine 1** : 
- Gain = +30 g
- Poids total = 150 + 30 = **180 g**

**Semaine 2** :
- Gain = +40 g  
- Poids total = 180 + 40 = **220 g**

## 🚀 Structure du Projet

### Base de données (SQL Server)

```
📊 Tables principales :
├── Race : Les différentes races de poulets
├── Croissance : Modèle de croissance par race et semaine
├── Lot : Groupes de poulets
├── Mortalite : Enregistrement des décès
├── Distribution_Nourriture : Suivi de la nourriture distribuée
├── Oeuf : Récolte des œufs
└── Incubation : Gestion de l'incubation
```

### Backend (Node.js + Express)

```
📁 backend/src/
├── controllers/
│   ├── raceController.js       # Gestion des races
│   ├── lotController.js        # Gestion des lots
│   ├── croissanceController.js # Modèles de croissance
│   └── mortaliteController.js  # Gestion des mortalités
├── routes/
│   └── index.js                # Routes API
└── config/
    └── database.js             # Connexion SQL Server
```

### Frontend (Angular + TypeScript)

```
📁 frontend/src/app/
├── models/
│   └── elevage.model.ts        # Interfaces TypeScript
├── services/
│   ├── race.service.ts         # Service API races
│   ├── lot.service.ts          # Service API lots
│   ├── croissance.service.ts   # Service API croissance
│   └── mortalite.service.ts    # Service API mortalités
└── components/
    └── lot-list/               # Composant d'affichage des lots
        ├── lot-list.component.ts
        ├── lot-list.component.html
        └── lot-list.component.css
```

## 🔌 API Endpoints

### Races

```
GET    /api/races              # Liste toutes les races
GET    /api/races/:id          # Détails d'une race
GET    /api/races/:id/croissance  # Modèle de croissance d'une race
POST   /api/races              # Créer une race
PUT    /api/races/:id          # Modifier une race
DELETE /api/races/:id          # Supprimer une race
```

### Lots

```
GET    /api/lots               # Liste tous les lots
GET    /api/lots/:id           # Détails d'un lot
GET    /api/lots/:id/poids     # Calcul du poids actuel du lot ⭐
POST   /api/lots               # Créer un lot
PUT    /api/lots/:id           # Modifier un lot
DELETE /api/lots/:id           # Supprimer un lot
```

### Croissance

```
GET    /api/croissance              # Toutes les données de croissance
GET    /api/croissance/race/:id     # Croissance par race
POST   /api/croissance              # Ajouter une entrée
PUT    /api/croissance/:id          # Modifier une entrée
DELETE /api/croissance/:id          # Supprimer une entrée
```

### Mortalités

```
GET    /api/mortalites              # Toutes les mortalités
GET    /api/mortalites/lot/:id      # Mortalités d'un lot
POST   /api/mortalites              # Enregistrer une mortalité
DELETE /api/mortalites/:id          # Supprimer une entrée
```

## 💡 Fonctionnalité Clé : Calcul Automatique du Poids

### Endpoint : `GET /api/lots/:id/poids`

Cet endpoint **calcule automatiquement** :

1. **L'âge du lot** (en semaines) : 
   - Différence entre aujourd'hui et la date d'entrée

2. **Le poids unitaire actuel** :
   - Somme des gains de poids jusqu'à la semaine actuelle
   - Basé sur le modèle de croissance de la race

3. **Le nombre actuel de poulets** :
   - Nombre initial - mortalités

4. **Le poids total du lot** :
   - Poids unitaire × nombre actuel

5. **La nourriture consommée** :
   - Somme cumulée de la nourriture

### Exemple de réponse :

```json
{
  "success": true,
  "data": {
    "id_lot": 1,
    "nom_race": "Race R1",
    "date_entree": "2026-01-15",
    "age_semaines": 7,
    "nombre_initial": 100,
    "nombre_actuel": 98,
    "mortalites": 2,
    "poids_unitaire": 570,
    "poids_total": 55860,
    "nourriture_cumulee": 800,
    "detail_croissance": [
      { "semaine": 0, "gain_poids": 150, "poids_cumule": 150, "nourriture": 0, "nourriture_cumulee": 0 },
      { "semaine": 1, "gain_poids": 30, "poids_cumule": 180, "nourriture": 60, "nourriture_cumulee": 60 },
      { "semaine": 2, "gain_poids": 40, "poids_cumule": 220, "nourriture": 60, "nourriture_cumulee": 120 },
      ...
    ]
  }
}
```

## 🎨 Interface Utilisateur

### Page d'accueil : Liste des Lots

L'interface affiche :
- **Cartes des lots** avec informations de base
- **Clic sur une carte** → ouvre les détails avec calcul automatique

### Détails d'un Lot

Affiche :
- **Statistiques clés** (âge, nombre actuel, mortalités, poids)
- **Tableau de croissance** détaillé semaine par semaine
- **Ligne actuelle** mise en évidence
- **Explication du calcul** avec formules

## 📦 Données d'Exemple Incluses

Le fichier `database/init.sql` crée automatiquement :

### 3 Races

1. **Race R1** : Croissance standard
2. **Race R2** : Croissance améliorée
3. **Race R3** : Croissance économique

### 4 Lots

- Lot 1 : 100 poulets Race R1 (entrée 15/01/2026)
- Lot 2 : 150 poulets Race R1 (entrée 01/02/2026)
- Lot 3 : 120 poulets Race R2 (entrée 20/01/2026)
- Lot 4 : 80 poulets Race R3 (entrée 10/02/2026)

### Modèles de croissance complets

Pour chaque race : 11 semaines de données (semaine 0 à 10)

## 🚀 Démarrage Rapide

### 1. Initialiser la base de données

```bash
# Avec Docker
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P MotDePasseFort123! -C < database/init.sql

# Ou avec npm
npm run db:init
```

### 2. Démarrer le backend

```bash
cd backend
npm run dev
```

Le backend sera accessible sur http://localhost:3000

### 3. Démarrer le frontend

```bash
cd frontend
npm start
```

Le frontend sera accessible sur http://localhost:4200

## 🧪 Tester l'API

### Récupérer tous les lots

```bash
curl http://localhost:3000/api/lots
```

### Calculer le poids d'un lot

```bash
curl http://localhost:3000/api/lots/1/poids
```

### Récupérer les races

```bash
curl http://localhost:3000/api/races
```

### Récupérer le modèle de croissance d'une race

```bash
curl http://localhost:3000/api/races/1/croissance
```

## 📝 Ajouter un Nouveau Lot

### Via l'API

```bash
curl -X POST http://localhost:3000/api/lots \
  -H "Content-Type: application/json" \
  -d '{
    "id_race": 1,
    "date_entree": "2026-03-05",
    "nombre_initial": 200,
    "cout_achat": 30000
  }'
```

### Résultat

Le système calculera automatiquement :
- L'âge du lot (basé sur la date d'entrée)
- Le poids actuel de chaque poulet
- Le poids total du lot

## 🎓 Comprendre le Calcul

### Formule de base

```
Poids à la semaine N = Poids initial + Σ(gains de poids de la semaine 1 à N)
```

### Exemple pour un lot de 7 semaines (Race R1)

```
Semaine 0 : 150 g (poids initial)
Semaine 1 : 150 + 30 = 180 g
Semaine 2 : 180 + 40 = 220 g
Semaine 3 : 220 + 50 = 270 g
Semaine 4 : 270 + 60 = 330 g
Semaine 5 : 330 + 70 = 400 g
Semaine 6 : 400 + 80 = 480 g
Semaine 7 : 480 + 90 = 570 g ✅

Poids total du lot (100 poulets) = 570 g × 100 = 57 kg
```

## 🔧 Personnalisation

### Ajouter une nouvelle race

1. Insérer dans la table `Race`
2. Ajouter son modèle de croissance dans `Croissance`
3. Le système utilisera automatiquement le modèle pour les calculs

### Modifier un modèle de croissance

1. Mettre à jour la table `Croissance`
2. Les calculs seront automatiquement mis à jour

## 📊 Architecture de Calcul

```
┌─────────────┐
│   Lot       │
│ (date entrée)│
└──────┬──────┘
       │
       ├──→ Calcul âge (semaines) = (Aujourd'hui - Date entrée) / 7
       │
       ↓
┌─────────────┐
│   Race      │
│ (id_race)   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Croissance  │
│ (par semaine)│
└──────┬──────┘
       │
       ├──→ Somme des gains jusqu'à semaine N
       │
       ↓
┌─────────────┐
│ Poids Final │
│ = Σ gains   │
└─────────────┘
       │
       ├──→ × Nombre de poulets actuels
       │
       ↓
┌─────────────┐
│ Poids Total │
│   du Lot    │
└─────────────┘
```

## 🎯 Pourquoi ce système ?

✅ **Gestion automatique** : Plus besoin de calculer manuellement le poids

✅ **Suivi précis** : Historique complet de la croissance

✅ **Prédictions** : Anticiper le poids futur des lots

✅ **Optimisation** : Comparer les performances entre races

✅ **Rentabilité** : Calculer les coûts et revenus automatiquement

## 📚 Documentation API Complète

Voir [backend/README.md](backend/README.md) pour plus de détails sur chaque endpoint.

## 🤝 Support

Pour toute question ou problème, référez-vous aux logs :

```bash
# Logs backend
cd backend && npm run dev

# Logs base de données
docker logs sqlserver

# Logs Docker Compose
docker-compose logs -f
```

---

**Bon élevage ! 🐔**
