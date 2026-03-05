#!/bin/bash

echo "🚀 Démarrage du projet Full-Stack"
echo "=================================="
echo ""

# Vérifier si Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Vérifier si le conteneur SQL Server existe déjà
if docker ps -a | grep -q sqlserver; then
    echo "📦 Conteneur SQL Server détecté"
    
    # Vérifier si le conteneur est en cours d'exécution
    if ! docker ps | grep -q sqlserver; then
        echo "🔄 Démarrage du conteneur SQL Server..."
        docker start sqlserver
        echo "⏳ Attente de SQL Server (30 secondes)..."
        sleep 30
    else
        echo "✅ SQL Server est déjà en cours d'exécution"
    fi
else
    echo "🐳 Démarrage des services Docker Compose..."
    docker-compose up -d
    echo "⏳ Attente de l'initialisation de SQL Server (40 secondes)..."
    sleep 40
fi

echo ""
echo "📊 Initialisation de la base de données..."
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P MotDePasseFort123! -C < database/init.sql

echo ""
echo "🔧 Installation des dépendances du backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Dépendances déjà installées"
fi

echo ""
echo "🎨 Installation des dépendances du frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Dépendances déjà installées"
fi

cd ..

echo ""
echo "✨ Tout est prêt !"
echo "=================================="
echo ""
echo "Pour démarrer le backend :"
echo "  cd backend && npm run dev"
echo ""
echo "Pour démarrer le frontend :"
echo "  cd frontend && npm start"
echo ""
echo "URLs :"
echo "  🔗 Backend API: http://localhost:3000"
echo "  🔗 Frontend: http://localhost:4200"
echo "  🔗 SQL Server: localhost:1433"
echo ""
