#!/bin/bash

echo "🚀 Initialisation du Système d'Élevage de Poulets"
echo "=================================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Docker est en cours d'exécution
echo -e "${BLUE}Vérification de Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker est en cours d'exécution${NC}"
echo ""

# Vérifier si le conteneur SQL Server existe
echo -e "${BLUE}Vérification du conteneur SQL Server...${NC}"
if docker ps -a | grep -q sqlserver; then
    if ! docker ps | grep -q sqlserver; then
        echo -e "${YELLOW}🔄 Démarrage du conteneur SQL Server...${NC}"
        docker start sqlserver
        echo -e "${YELLOW}⏳ Attente de SQL Server (30 secondes)...${NC}"
        sleep 30
    else
        echo -e "${GREEN}✅ SQL Server est déjà en cours d'exécution${NC}"
    fi
else
    echo -e "${RED}❌ Conteneur SQL Server non trouvé.${NC}"
    echo -e "${YELLOW}Veuillez créer un conteneur SQL Server d'abord.${NC}"
    exit 1
fi
echo ""

# Initialiser la base de données
echo -e "${BLUE}📊 Initialisation de la base de données 'elevage'...${NC}"
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P MotDePasseFort123! -C << EOF
-- Créer la base de données si elle n'existe pas
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'elevage')
BEGIN
    CREATE DATABASE elevage;
    PRINT 'Base de données elevage créée avec succès';
END
GO
EOF

echo ""
echo -e "${BLUE}📋 Création des tables et insertion des données...${NC}"
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P MotDePasseFort123! -d elevage -C < database/init.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Base de données initialisée avec succès !${NC}"
else
    echo ""
    echo -e "${RED}❌ Erreur lors de l'initialisation de la base de données${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Installation des dépendances du backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✅ Dépendances déjà installées${NC}"
fi

echo ""
echo -e "${BLUE}🎨 Installation des dépendances du frontend...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✅ Dépendances déjà installées${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Tout est prêt ! ✨${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📚 Données d'exemple créées :${NC}"
echo ""
echo "  🐔 3 Races de poulets (R1, R2, R3)"
echo "  📊 Modèles de croissance complets (10 semaines)"
echo "  📦 4 Lots de poulets avec différentes dates d'entrée"
echo ""
echo -e "${YELLOW}Pour démarrer l'application :${NC}"
echo ""
echo -e "  ${BLUE}1. Backend :${NC}"
echo "     cd backend && npm run dev"
echo ""
echo -e "  ${BLUE}2. Frontend (dans un autre terminal) :${NC}"
echo "     cd frontend && npm start"
echo ""
echo -e "${YELLOW}URLs :${NC}"
echo "  🔗 Frontend : http://localhost:4200"
echo "  🔗 Backend  : http://localhost:3000"
echo "  🔗 API Lots : http://localhost:3000/api/lots"
echo ""
echo -e "${YELLOW}Tester l'API :${NC}"
echo "  curl http://localhost:3000/api/lots"
echo "  curl http://localhost:3000/api/lots/1/poids"
echo ""
echo -e "${BLUE}📖 Documentation complète :${NC}"
echo "  → DOCUMENTATION-ELEVAGE.md"
echo ""
