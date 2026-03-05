#!/bin/bash

echo "🧪 Test de l'API - Système d'Élevage"
echo "===================================="
echo ""

BASE_URL="http://localhost:3000/api"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Test 1 : Santé du serveur${NC}"
curl -s http://localhost:3000/health | jq '.'
echo ""

echo -e "${BLUE}Test 2 : Liste des races${NC}"
curl -s $BASE_URL/races | jq '.data[] | {id_race, nom_race, semaine_debut_ponte}'
echo ""

echo -e "${BLUE}Test 3 : Modèle de croissance de la Race R1${NC}"
curl -s $BASE_URL/races/1/croissance | jq '.data[] | {semaine, gain_poids, nourriture}'
echo ""

echo -e "${BLUE}Test 4 : Liste des lots${NC}"
curl -s $BASE_URL/lots | jq '.data[] | {id_lot, nom_race, date_entree, nombre_initial}'
echo ""

echo -e "${BLUE}Test 5 : Calcul du poids du Lot #1 ⭐${NC}"
echo -e "${YELLOW}(Calcul automatique du poids avec croissance)${NC}"
curl -s $BASE_URL/lots/1/poids | jq '.'
echo ""

echo -e "${BLUE}Test 6 : Calcul du poids du Lot #2 ⭐${NC}"
curl -s $BASE_URL/lots/2/poids | jq '.data | {
  id_lot,
  nom_race,
  age_semaines,
  nombre_actuel,
  poids_unitaire,
  poids_total_kg: (.poids_total / 1000)
}'
echo ""

echo -e "${GREEN}✅ Tests terminés !${NC}"
echo ""
echo -e "${YELLOW}Pour voir les détails complets d'un lot :${NC}"
echo "  curl http://localhost:3000/api/lots/1/poids | jq '.'"
echo ""
