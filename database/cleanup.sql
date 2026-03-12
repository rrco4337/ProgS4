-- Ce fichier sert a vider toutes les tables de la base de donnees elevage
-- On l'utilise quand on veut repartir de zero avec des donnees propres

-- On dit qu'on veut travailler sur la base de donnees elevage
USE elevage;
GO

-- Si une erreur arrive, on annule tout automatiquement
SET XACT_ABORT ON;
-- On commence une transaction (tout se passe en meme temps ou rien du tout)
BEGIN TRANSACTION;

-- ETAPE 1: On coupe tous les liens entre les tables pour eviter les problemes
-- Brise les cycles eventuels (Lot → Incubation → Oeuf → Lot)
-- On enleve toutes les references qui pourraient generer des blocages
UPDATE Lot SET id_incubation = NULL WHERE id_incubation IS NOT NULL;

-- ETAPE 2: On vide toutes les tables une par une
-- On commence par les tables qui dependent d'autres (enfants en premier)
-- L'ordre est important pour respecter les contraintes de cles etrangeres

-- Tables les plus dependantes d'abord
PRINT 'Suppression des donnees de distribution de nourriture...'
DELETE FROM Distribution_Nourriture;

PRINT 'Suppression des donnees de mortalite...'
DELETE FROM Mortalite;

PRINT 'Suppression des donnees de vente d oeufs...'
DELETE FROM VenteOeuf;

PRINT 'Suppression des donnees d oeufs...'
DELETE FROM Oeuf;

PRINT 'Suppression des donnees d incubation...'
DELETE FROM Incubation;

PRINT 'Suppression des donnees de croissance...'
DELETE FROM Croissance;

PRINT 'Suppression des lots...'
DELETE FROM Lot;

PRINT 'Suppression des races...'
DELETE FROM Race;

-- ETAPE 3: On remet tous les compteurs automatiques a zero
-- Reinitialise les compteurs IDENTITY pour un jeu propre
-- Ces commandes remettent les numeros automatiques a zero

PRINT 'Remise a zero des compteurs automatiques...'

-- Remet le compteur de Distribution_Nourriture a zero
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Distribution_Nourriture')
    DBCC CHECKIDENT ('Distribution_Nourriture', RESEED, 0);

-- Remet le compteur de Mortalite a zero
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Mortalite')
    DBCC CHECKIDENT ('Mortalite', RESEED, 0);

-- Remet le compteur de VenteOeuf a zero
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'VenteOeuf')
    DBCC CHECKIDENT ('VenteOeuf', RESEED, 0);

-- Remet le compteur de Oeuf a zero
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Oeuf')
    DBCC CHECKIDENT ('Oeuf', RESEED, 0);

-- Remet le compteur de Incubation a zero
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Incubation')
    DBCC CHECKIDENT ('Incubation', RESEED, 0);

-- Remet le compteur de Croissance a zero
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Croissance')
    DBCC CHECKIDENT ('Croissance', RESEED, 0);

-- Remet le compteur de Lot a zero
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Lot')
    DBCC CHECKIDENT ('Lot', RESEED, 0);

-- Remet le compteur de Race a zero
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Race')
    DBCC CHECKIDENT ('Race', RESEED, 0);

-- ETAPE 4: Verification finale
PRINT 'Verification du nettoyage...'
SELECT 
    'Distribution_Nourriture' as TableName, COUNT(*) as NombreLignes FROM Distribution_Nourriture
UNION ALL
SELECT 'Mortalite', COUNT(*) FROM Mortalite
UNION ALL
SELECT 'VenteOeuf', COUNT(*) FROM VenteOeuf
UNION ALL
SELECT 'Oeuf', COUNT(*) FROM Oeuf
UNION ALL
SELECT 'Incubation', COUNT(*) FROM Incubation
UNION ALL
SELECT 'Croissance', COUNT(*) FROM Croissance
UNION ALL
SELECT 'Lot', COUNT(*) FROM Lot
UNION ALL
SELECT 'Race', COUNT(*) FROM Race;

-- On valide tous les changements d'un coup
PRINT 'Nettoyage termine avec succes!'
COMMIT;
GO
