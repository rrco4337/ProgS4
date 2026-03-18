# Analyse complète du codebase (17/03/2026)

## 1) Vue d'ensemble
- **Type de projet**: application full-stack d'élevage avicole.
- **Backend**: Node.js + Express (`backend/src`).
- **Frontend**: Angular 21 (`frontend/src`).
- **Base de données**: Azure SQL Edge / SQL Server via Docker (`docker-compose.yml`, `database/*.sql`).
- **Objectif fonctionnel principal**: gestion des races, lots, croissance, mortalité, œufs, incubations et ventes, avec éclosion automatique planifiée.

## 2) Architecture backend
### Entrée serveur
- Fichier principal: `backend/src/server.js`.
- Middlewares: `cors`, parsing JSON/urlencoded.
- Endpoints:
  - `GET /health`
  - API métier préfixée en `/api`.
- Démarrage conditionné à la connexion SQL via `getConnection()`.

### API REST
- Routeur central: `backend/src/routes/index.js`.
- Domaines exposés:
  - `races`
  - `lots`
  - `croissance`
  - `mortalites`
  - `oeufs`
  - `incubations`
  - `ventes-oeufs`

### Services techniques
- Connexion DB: `backend/src/config/database.js` (driver `mssql`, pool, `encrypt: true`, `trustServerCertificate: true`).
- Service planifié: `backend/src/services/autoIncubationService.js`.
  - Déclenchement cron: `0 0,6,12,18 * * *` (4 fois/jour, timezone Europe/Paris).
  - Crée automatiquement un nouveau lot quand une incubation arrive à échéance.

## 3) Architecture frontend
- Routing principal: `frontend/src/app/app.routes.ts`.
- Écrans principaux:
  - Home
  - Lots
  - Races
  - Croissance
  - Mortalités
  - Œufs
- Couche HTTP: `frontend/src/app/services/api.ts` (wrapper GET/POST/PUT/DELETE + gestion d'erreurs).
- URL API dev: `frontend/src/environments/environment.ts` → `http://localhost:3000/api`.

## 4) Données et SQL
- Script d'initialisation: `database/init.sql`.
  - Crée la base `elevage` si absente.
  - Crée le schéma principal (Race, Lot, Croissance, Oeuf, Incubation, Mortalite, ...).
- Plusieurs scripts de migration existent dans `database/` pour faire évoluer le modèle.

## 5) Docker / exécution locale
- Le service SQL est défini dans `docker-compose.yml`.
- Le backend dépend de variables `.env` (`DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`).
- Point d'attention observé: si la base `elevage` n'est pas initialisée, le backend échoue avec `Login failed for user 'sa'` (SQL State 38 / DB introuvable).

## 6) Risques et incohérences détectés
1. Le script racine `db:init` dans `package.json` référence le conteneur `sqlserver`, alors que le nom peut varier si `container_name` n'est pas forcé.
2. Le backend démarre uniquement si la DB est prête; il manque une phase d'init SQL automatisée côté compose.
3. Les logs `dotenv` sont chargés deux fois (probablement un double `require('dotenv').config()` dans le bootstrap global + config DB).

## 7) Recommandations prioritaires
1. Adapter `db:init` pour cibler le service Compose plutôt qu'un nom de conteneur fixe.
2. Ajouter un mécanisme d'initialisation SQL reproductible (script init au démarrage ou conteneur init dédié).
3. Documenter une séquence unique de boot local: `docker compose up -d` → init SQL → `npm start` backend → `npm start` frontend.

---
Analyse basée sur la structure et les fichiers clés du workspace au 17/03/2026.
