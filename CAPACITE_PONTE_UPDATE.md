# Ajout de la Capacité de Ponte des Races

## 📋 Résumé des modifications

Cette mise à jour ajoute la capacité de ponte des races, permettant de calculer la production maximale d'œufs pour chaque lot basée sur le nombre de poules et la capacité productive de leur race.

## 🔧 Modifications Backend

### Base de données
- **Fichier**: `database/migration_capacite_ponte.sql`
- **Changement**: Ajoute la colonne `capacite_ponte INT DEFAULT 300 NOT NULL` à la table Race
- **Valeurs par défaut**:
  - Races moyennes: 300 œufs/vie
  - Races pondeuses (Leghorn, Rhode Island): 320 œufs/vie
  - Races rustiques (Brahma, Cochin): 250-280 œufs/vie
  - Races ornementales (Soie): 200 œufs/vie

### Contrôleur Race
- **Fichier**: `backend/src/controllers/raceController.js`
- **Changement**: Mise à jour des fonctions `create` et `update` pour inclure `capacite_ponte`
- **Valeur par défaut**: 300 œufs si non spécifiée

## 🖥️ Modifications Frontend

### Modèle TypeScript
- **Fichier**: `frontend/src/app/models/elevage.model.ts`
- **Changement**: Ajoute `capacite_ponte: number` à l'interface `Race`

### Composant Race
- **Fichier**: `frontend/src/app/components/race-list/`
- **Changements**:
  - Affichage de la capacité de ponte dans les cartes de race
  - Saisie de la capacité dans les formulaires de création/modification
  - Valeur par défaut: 300 œufs/vie

### Composant Lot
- **Fichier**: `frontend/src/app/components/lot-list/`
- **Changements**:
  - Nouvelles méthodes de calcul:
    - `getProductionMaximale(lot)`: Calcule nb_poules × capacite_ponte
    - `getPourcentageProduction(lot)`: % d'œufs récoltés vs maximum
    - `getOeufsRestants(lot)`: Œufs restants à produire
  - Section "Production d'Œufs" dans les détails du lot
  - Affichage de la production maximale dans les cartes de lot

## 📊 Nouvelles Métriques Disponibles

### Par lot :
1. **Production Maximale**: Nombre total d'œufs que le lot peut produire dans sa vie
   - *Formule*: `nombre_initial × capacite_ponte`

2. **Pourcentage de Production**: Avancement de la production par rapport au potentiel
   - *Formule*: `(oeufs_recoltes / production_maximale) × 100`

3. **Potentiel Restant**: Nombre d'œufs encore à récolter
   - *Formule*: `production_maximale - oeufs_recoltes`

## 💡 Exemples d'utilisation

### Exemple 1: Lot de 100 poules Leghorn
- Race Leghorn : 320 œufs/vie
- Production maximale : 100 × 320 = **32 000 œufs**
- Si 15 000 œufs récoltés : **46,9% du potentiel**
- Potentiel restant : **17 000 œufs**

### Exemple 2: Lot de 50 poules Brahma
- Race Brahma : 250 œufs/vie  
- Production maximale : 50 × 250 = **12 500 œufs**
- Si 8 000 œufs récoltés : **64% du potentiel**
- Potentiel restant : **4 500 œufs**

## 🚀 Déploiement

### Prérequis
1. Exécuter la migration SQL : `database/migration_capacite_ponte.sql`
2. Redémarrer le backend pour charger les nouvelles fonctionnalités
3. Actualiser le frontend

### Vérifications post-déploiement
1. ✅ Vérifier que les races existantes ont une capacité de ponte par défaut (300)
2. ✅ Tester la création/modification de races avec la nouvelle propriété
3. ✅ Vérifier l'affichage des métriques de production dans les lots
4. ✅ Contrôler que les calculs sont corrects

## 🎯 Bénéfices

1. **Planification**: Anticiper la production maximale d'un lot
2. **Optimisation**: Identifier les lots sous-performants
3. **Gestion**: Prévoir les revenus potentiels futurs  
4. **Sélection**: Comparer les races sur leur capacité productive

---
*Mise à jour réalisée le 12 mars 2026*