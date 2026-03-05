# Backend Node.js - API REST

## Description
Backend développé avec Node.js et Express, connecté à SQL Server.

## Technologies
- **Node.js** avec Express
- **SQL Server** (via mssql)
- **CORS** pour la communication frontend
- **dotenv** pour la gestion des variables d'environnement

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du dossier backend :

```env
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=MotDePasseFort123!
DB_DATABASE=AppDatabase

PORT=3000
NODE_ENV=development
```

## Scripts disponibles

- `npm start` : Démarre le serveur en mode production
- `npm run dev` : Démarre le serveur en mode développement avec nodemon

## Structure du projet

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Configuration SQL Server
│   ├── controllers/
│   │   └── exampleController.js
│   ├── models/               # Vos modèles
│   ├── routes/
│   │   └── index.js          # Routes de l'API
│   ├── middleware/           # Middlewares personnalisés
│   └── server.js             # Point d'entrée
├── .env                      # Variables d'environnement
└── package.json
```

## Endpoints API

- `GET /health` : Vérification de l'état du serveur
- `GET /api/example` : Liste tous les éléments
- `GET /api/example/:id` : Récupère un élément par ID
- `POST /api/example` : Crée un nouvel élément
- `PUT /api/example/:id` : Met à jour un élément
- `DELETE /api/example/:id` : Supprime un élément

## Démarrage

```bash
npm run dev
```

Le serveur démarre sur http://localhost:3000
