# Projet Full-Stack : Node.js + Angular + SQL Server

## 📋 Description

Projet full-stack avec :
- **Backend** : Node.js avec Express
- **Frontend** : Angular avec TypeScript
- **Base de données** : SQL Server sous Docker

## 🏗️ Architecture

```
rattrapageProg/
├── backend/              # API REST Node.js
│   ├── src/
│   │   ├── config/      # Configuration (DB, etc.)
│   │   ├── controllers/ # Logique métier
│   │   ├── models/      # Modèles de données
│   │   ├── routes/      # Routes API
│   │   ├── middleware/  # Middlewares personnalisés
│   │   └── server.js    # Point d'entrée
│   ├── .env             # Variables d'environnement
│   ├── Dockerfile
│   └── package.json
│
├── frontend/            # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/  # Services (API, etc.)
│   │   │   └── ...
│   │   └── environments/  # Configuration environnements
│   ├── Dockerfile
│   └── package.json
│
├── database/            # Scripts SQL
│   └── init.sql         # Script d'initialisation
│
├── docker-compose.yml   # Orchestration des services
├── identifiant          # Informations conteneur SQL Server
└── README.md
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js (v20 ou supérieur)
- Docker et Docker Compose
- npm ou yarn

### Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd rattrapageProg
   ```

2. **Démarrer les services avec Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   Cela démarre :
   - SQL Server (port 1433)
   - Backend Node.js (port 3000)

3. **Installer et démarrer le frontend** (en développement local)
   ```bash
   cd frontend
   npm install
   npm start
   ```
   
   Le frontend sera accessible sur http://localhost:4200

### Avec le conteneur SQL Server existant

Si vous utilisez le conteneur SQL Server existant (comme indiqué dans le fichier `identifiant`) :

```bash
# 1. Démarrer le backend
cd backend
npm install
npm run dev

# 2. Démarrer le frontend (dans un autre terminal)
cd frontend
npm install
npm start
```

## 🔧 Configuration

### Backend (.env)

Le fichier `backend/.env` contient :
```env
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=MotDePasseFort123!
DB_DATABASE=AppDatabase
PORT=3000
NODE_ENV=development
```

### Frontend (environments)

- `frontend/src/environments/environment.ts` pour le développement
- `frontend/src/environments/environment.prod.ts` pour la production

## 📡 API Endpoints

Le backend expose les endpoints suivants :

- `GET /health` - Vérification de l'état du serveur
- `GET /api/example` - Liste tous les éléments
- `GET /api/example/:id` - Récupère un élément par ID
- `POST /api/example` - Crée un nouvel élément
- `PUT /api/example/:id` - Met à jour un élément
- `DELETE /api/example/:id` - Supprime un élément

## 🗄️ Base de données

Le script `database/init.sql` crée automatiquement :
- La base de données `AppDatabase`
- Une table `Examples` avec des données de test

### Se connecter à SQL Server

```bash
docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P MotDePasseFort123! -C
```

## 🛠️ Commandes utiles

### Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Backend

```bash
cd backend
npm start       # Mode production
npm run dev     # Mode développement avec nodemon
```

### Frontend

```bash
cd frontend
npm start       # Serveur de développement
npm run build   # Build de production
```

## 📝 Développement

### Créer un nouveau endpoint

1. Créer un contrôleur dans `backend/src/controllers/`
2. Ajouter les routes dans `backend/src/routes/`
3. Créer un service Angular dans `frontend/src/app/services/`
4. Utiliser le service dans vos composants

### Exemple de service Angular

```typescript
import { Api } from './services/api';

export class MyComponent {
  constructor(private api: Api) {}

  loadData() {
    this.api.get<any>('example').subscribe({
      next: (data) => console.log(data),
      error: (err) => console.error(err)
    });
  }
}
```

## 🔒 Sécurité

⚠️ **Important** : Ne jamais committer les fichiers `.env` avec des mots de passe réels en production.

## 📚 Documentation

- [Documentation Backend](backend/README.md)
- [Documentation Frontend](frontend/README-CUSTOM.md)

## 🤝 Contribution

1. Créer une branche pour votre fonctionnalité
2. Commit vos changements
3. Push vers la branche
4. Créer une Pull Request

## 📄 Licence

MIT
