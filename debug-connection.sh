#!/bin/bash

echo "🔍 Debug Frontend-Backend Connection"
echo "====================================="
echo ""

# Tester si le backend fonctionne
echo "1. Test de santé du backend :"
curl -s http://localhost:3000/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend accessible"
else
    echo "❌ Backend non accessible sur http://localhost:3000"
    echo "   → Vérifiez que 'cd backend && npm start' est en cours"
    exit 1
fi

# Tester l'API
echo ""
echo "2. Test API races :"
RESPONSE=$(curl -s http://localhost:3000/api/races)
if echo "$RESPONSE" | jq '.success' > /dev/null 2>&1; then
    echo "✅ API races fonctionne"
    echo "   Données : $(echo "$RESPONSE" | jq '.data | length') races trouvées"
else
    echo "❌ API races ne répond pas correctement"
    echo "   Réponse : $RESPONSE"
fi

# Tester CORS
echo ""
echo "3. Test CORS :"
CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:4200" \
                     -H "Access-Control-Request-Method: GET" \
                     -H "Access-Control-Request-Headers: content-type" \
                     -X OPTIONS http://localhost:3000/api/races)

if [ -z "$CORS_RESPONSE" ]; then
    echo "✅ CORS autorisé (pas de réponse = OK pour OPTIONS)"
else
    echo "ℹ️  CORS response : $CORS_RESPONSE"
fi

# Vérifier si le frontend serve fonctionne
echo ""
echo "4. Test frontend :"
if curl -s http://localhost:4200 > /dev/null; then
    echo "✅ Frontend accessible sur http://localhost:4200"
else
    echo "❌ Frontend non accessible"
    echo "   → Vérifiez que 'cd frontend && ng serve' est en cours"
fi

echo ""
echo "5. Conseils de debug :"
echo "   → Ouvrez la console du navigateur (F12) sur http://localhost:4200"
echo "   → Onglet Network : voyez-vous les requêtes vers localhost:3000/api/races ?"
echo "   → S'il y a des erreurs CORS, elles apparaîtront dans Console"
echo ""