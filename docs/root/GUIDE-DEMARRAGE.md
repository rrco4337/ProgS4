# 🚀 Guide de Démarrage Rapide

## Étape 1 : Vérifier les prérequis

Assurez-vous d'avoir installé :
- ✅ Node.js (v20 ou supérieur)
- ✅ Docker Desktop (en cours d'exécution)
- ✅ npm

## Étape 2 : Installer toutes les dépendances

À la racine du projet, exécutez :

```bash
npm run install:all
```

Ou manuellement :

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Étape 3 : Démarrer SQL Server

Vous avez déjà un conteneur SQL Server qui tourne !

Informations de connexion (voir fichier `identifiant`) :
- **Conteneur** : sqlserver
- **Port** : 1433
- **Utilisateur** : sa
- **Mot de passe** : MotDePasseFort123!

Si besoin de le redémarrer :

```bash
docker restart sqlserver
```

## Étape 4 : Initialiser la base de données

```bash
npm run db:init
```

Ou avec Docker directement :

```bash
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P MotDePasseFort123! -C < database/init.sql
```

## Étape 5 : Démarrer le backend

Dans un terminal :

```bash
cd backend
npm run dev
```

Le backend sera accessible sur **http://localhost:3000**

Testez avec : http://localhost:3000/health

## Étape 6 : Démarrer le frontend

Dans un autre terminal :

```bash
cd frontend
npm start
```

Le frontend sera accessible sur **http://localhost:4200**

## 🎉 C'est parti !

Votre application full-stack est maintenant en cours d'exécution :

- 🔧 **Backend API** : http://localhost:3000
- 🎨 **Frontend Angular** : http://localhost:4200
- 🗄️ **SQL Server** : localhost:1433

## 📚 Endpoints API disponibles

- `GET http://localhost:3000/health` - État du serveur
- `GET http://localhost:3000/api/example` - Liste des exemples
- `POST http://localhost:3000/api/example` - Créer un exemple
- `PUT http://localhost:3000/api/example/:id` - Modifier un exemple
- `DELETE http://localhost:3000/api/example/:id` - Supprimer un exemple

## 🛠️ Commandes utiles

```bash
# À la racine du projet
npm run docker:up          # Démarrer Docker Compose
npm run docker:down        # Arrêter Docker Compose
npm run docker:logs        # Voir les logs Docker
npm run dev:backend        # Démarrer le backend
npm run dev:frontend       # Démarrer le frontend
npm run db:init           # Initialiser la base de données
```

## ❓ Problèmes courants

### Backend ne se connecte pas à SQL Server

Vérifiez que SQL Server est démarré :
```bash
docker ps | grep sqlserver
```

Si non, démarrez-le :
```bash
docker start sqlserver
```

### Erreur de port déjà utilisé

- Port 3000 (backend) : Un autre processus utilise ce port
- Port 4200 (frontend) : Un autre serveur Angular tourne
- Port 1433 (SQL Server) : Vérifiez les autres instances SQL Server

Utilisez `lsof -i :PORT` pour identifier le processus.

### Les modifications du frontend ne se reflètent pas

Redémarrez le serveur de développement Angular avec Ctrl+C puis `npm start`.

## 📖 Documentation complète

Consultez le [README.md](README.md) principal pour plus de détails.
