# 🐔 Système de Gestion d'Élevage de Poulets

## 📋 Description

Application full-stack complète pour la gestion d'élevage de poulets avec **calcul automatique de la croissance** basé sur des modèles prédéfinis par race.

### 🎯 Fonctionnalités Principales

✅ **Gestion des Lots** : Regroupement de poulets par race, date d'entrée et âge
✅ **Calcul Automatique** : Poids des poulets calculé automatiquement selon leur âge
✅ **Modèles de Croissance** : Définition par race avec gain de poids hebdomadaire
✅ **Suivi des Mortalités** : Enregistrement et calcul du nombre actuel
✅ **Interface Intuitive** : Visualisation claire avec tableaux de croissance détaillés
✅ **API REST Complète** : Backend robuste avec toutes les opérations CRUD

## 🏗️ Architecture

```
Backend : Node.js + Express + SQL Server
Frontend : Angular + TypeScript
Base de données : SQL Server (Docker)
```

## 💡 Concept Clé : Les Lots et la Croissance

### Un Lot = Groupe de Poulets Identiques

- Même **date d'entrée**
- Même **race**  
- Même **âge** (calculé automatiquement en semaines)

### Modèle de Croissance par Race

Exemple pour Race R1 :

| Semaine | Poids | Nourriture |
|---------|-------|------------|
| 0 | 150 g | 0 g |
| 1 | +30 g | 60 g |
| 2 | +40 g | 60 g |

**Calcul automatique :**
- Semaine 0 : poussin = 150 g
- Semaine 1 : 150 + 30 = **180 g**
- Semaine 2 : 180 + 40 = **220 g**

➡️ **Le système calcule automatiquement le poids du lot en fonction de son âge !**

## 🚀 Installation Rapide

### Option 1 : Script Automatique (Recommandé)

```bash
./init-elevage.sh
```

Ce script :
- ✅ Vérifie Docker
- ✅ Démarre SQL Server
- ✅ Crée la base de données `elevage`
- ✅ Insère les données d'exemple (3 races, 4 lots, modèles de croissance)
- ✅ Installe les dépendances

### Option 2 : Manuel

```bash
# 1. Initialiser la base de données
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P MotDePasseFort123! -d elevage -C < database/init.sql

# 2. Backend
cd backend
npm install
npm run dev

# 3. Frontend (nouveau terminal)
cd frontend
npm install
npm start
```

## 🌐 URLs

- 🎨 **Frontend** : http://localhost:4200
- 🔧 **Backend API** : http://localhost:3000
- 🏥 **Health Check** : http://localhost:3000/health
- 🗄️ **SQL Server** : localhost:1433 (sa / MotDePasseFort123!)

## 📡 API Endpoints Principaux

### Lots

```bash
GET  /api/lots              # Liste tous les lots
GET  /api/lots/:id          # Détails d'un lot
GET  /api/lots/:id/poids    # ⭐ Calcul automatique du poids
POST /api/lots              # Créer un lot
```

### Races

```bash
GET  /api/races                 # Liste des races
GET  /api/races/:id/croissance  # Modèle de croissance
```

### Autres

```bash
GET  /api/croissance            # Tous les modèles
GET  /api/mortalites            # Toutes les mortalités
```

## 🧪 Tester l'API

```bash
# Utiliser le script de test
./test-api.sh

# Ou manuellement
curl http://localhost:3000/api/lots
curl http://localhost:3000/api/lots/1/poids
```

### Exemple de Réponse : Calcul du Poids

```json
{
  "success": true,
  "data": {
    "id_lot": 1,
    "nom_race": "Race R1",
    "date_entree": "2026-01-15",
    "age_semaines": 7,
    "nombre_initial": 100,
    "nombre_actuel": 100,
    "mortalites": 0,
    "poids_unitaire": 570,
    "poids_total": 57000,
    "nourriture_cumulee": 800,
    "detail_croissance": [
      {
        "semaine": 0,
        "gain_poids": 150,
        "poids_cumule": 150,
        "nourriture": 0,
        "nourriture_cumulee": 0
      },
      {
        "semaine": 1,
        "gain_poids": 30,
        "poids_cumule": 180,
        "nourriture": 60,
        "nourriture_cumulee": 60
      }
      // ... jusqu'à la semaine 7
    ]
  }
}
```

## 🎨 Interface Utilisateur

### Vue Liste des Lots

<img width="1000" alt="Liste des lots" src="docs/lots-list.png">

- Cartes interactives pour chaque lot
- Informations de base (race, date, nombre)
- Clic pour voir les détails

### Vue Détails d'un Lot

<img width="1000" alt="Détails du lot" src="docs/lot-details.png">

- Statistiques en temps réel (âge, poids, mortalités)
- **Tableau de croissance** détaillé semaine par semaine
- **Ligne actuelle** mise en évidence
- **Explication du calcul** avec formules

## 📊 Données d'Exemple Incluses

### 3 Races

1. **Race R1** : Croissance standard (150g → 1270g en 10 semaines)
2. **Race R2** : Croissance améliorée (140g → 1290g en 10 semaines)
3. **Race R3** : Croissance économique (160g → 1258g en 10 semaines)

### 4 Lots

- Lot 1 : 100 poulets Race R1 (15/01/2026)
- Lot 2 : 150 poulets Race R1 (01/02/2026)
- Lot 3 : 120 poulets Race R2 (20/01/2026)
- Lot 4 : 80 poulets Race R3 (10/02/2026)

## 📁 Structure du Projet

```
rattrapageProg/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/            # Configuration DB
│   │   ├── controllers/       # Logique métier
│   │   │   ├── raceController.js
│   │   │   ├── lotController.js ⭐ (calcul poids)
│   │   │   ├── croissanceController.js
│   │   │   └── mortaliteController.js
│   │   ├── routes/            # Routes API
│   │   └── server.js          # Point d'entrée
│   ├── .env                   # Configuration
│   └── package.json
│
├── frontend/                   # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/        # Interfaces TypeScript
│   │   │   ├── services/      # Services API
│   │   │   └── components/
│   │   │       └── lot-list/  # Composant principal ⭐
│   │   └── environments/      # Configuration
│   └── package.json
│
├── database/
│   └── init.sql               # Script de création + données
│
├── init-elevage.sh            # 🚀 Script d'installation
├── test-api.sh                # 🧪 Script de test
├── DOCUMENTATION-ELEVAGE.md   # 📖 Documentation complète
└── README-ELEVAGE.md          # Ce fichier
```

## 🔧 Développement

### Ajouter une Nouvelle Race

1. Insérer dans la table `Race`
2. Ajouter son modèle dans `Croissance`
3. Le système calculera automatiquement le poids

### Modifier un Modèle de Croissance

Mettre à jour la table `Croissance` → calculs automatiquement mis à jour

### Créer un Nouveau Lot

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

### Enregistrer une Mortalité

```bash
curl -X POST http://localhost:3000/api/mortalites \
  -H "Content-Type: application/json" \
  -d '{
    "id_lot": 1,
    "date_mort": "2026-03-05",
    "nombre": 2
  }'
```

## 📖 Documentation Complète

- [DOCUMENTATION-ELEVAGE.md](DOCUMENTATION-ELEVAGE.md) : Guide complet
- [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md) : Démarrage rapide
- [backend/README.md](backend/README.md) : Documentation backend
- [frontend/README-CUSTOM.md](frontend/README-CUSTOM.md) : Documentation frontend

## 🎯 Cas d'Usage

### 1. Visualiser le Poids Actuel d'un Lot

```
Interface → Cliquer sur un lot → Voir poids actuel et croissance
```

### 2. Prévoir le Poids Futur

```
Consulter le tableau de croissance → Semaines futures affichées
```

### 3. Comparer les Races

```
API → Récupérer les modèles de croissance de chaque race
```

### 4. Calculer la Rentabilité

```
Poids actuel × Prix de vente - (Coût achat + Nourriture consommée)
```

## 🛠️ Commandes Utiles

```bash
# Initialiser tout
./init-elevage.sh

# Tester l'API
./test-api.sh

# Démarrer backend
cd backend && npm run dev

# Démarrer frontend
cd frontend && npm start

# Réinitialiser la base
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P MotDePasseFort123! -d elevage -C < database/init.sql

# Voir les logs SQL Server
docker logs sqlserver --tail 50

# Arrêter tout
docker-compose down
```

## ❓ Dépannage

### Le backend ne peut pas se connecter à SQL Server

```bash
# Vérifier que SQL Server tourne
docker ps | grep sqlserver

# Redémarrer si nécessaire
docker restart sqlserver
```

### Erreur de compilation Angular

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Base de données vide

```bash
# Réexécuter le script d'initialisation
./init-elevage.sh
```

## 🎓 Concepts Avancés

### Algorithme de Calcul du Poids

```typescript
poids_cumule = poids_initial
for (semaine = 1; semaine <= age_actuel; semaine++) {
    poids_cumule += gain_poids[semaine]
}
poids_total_lot = poids_cumule × nombre_poulets_actuels
```

### Gestion des Mortalités

```typescript
nombre_actuel = nombre_initial - SUM(mortalites)
```

### Calcul de l'Âge en Semaines

```typescript
age_semaines = floor((date_actuelle - date_entree) / 7 jours)
```

## 🚀 Évolutions Futures

- [ ] Graphiques de croissance
- [ ] Prédictions avec machine learning
- [ ] Export Excel/PDF des rapports
- [ ] Notifications automatiques (âge optimal de vente)
- [ ] Multi-utilisateurs avec authentification
- [ ] Application mobile

## 📝 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Créé avec ❤️ pour la gestion intelligente d'élevage de poulets**

**Date de création** : Mars 2026
**Version** : 1.0.0
