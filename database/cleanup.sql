-- Ce fichier sert a vider toutes les tables de la base de donnees elevage
-- On l'utilise quand on veut repartir de zero avec des donnees propres

-- On dit qu'on veut travailler sur la base de donnees elevage
USE elevage;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
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
IF OBJECT_ID('dbo.VenteOeuf', 'U') IS NOT NULL
    DELETE FROM VenteOeuf;

PRINT 'Suppression des donnees d oeufs...'
IF OBJECT_ID('dbo.Oeuf', 'U') IS NOT NULL
    DELETE FROM Oeuf;

PRINT 'Suppression des donnees d incubation...'
IF OBJECT_ID('dbo.Incubation', 'U') IS NOT NULL
    DELETE FROM Incubation;

PRINT 'Suppression des donnees de croissance...'
IF OBJECT_ID('dbo.Croissance', 'U') IS NOT NULL
    DELETE FROM Croissance;

PRINT 'Suppression des lots...'
IF OBJECT_ID('dbo.Lot', 'U') IS NOT NULL
    DELETE FROM Lot;

PRINT 'Suppression des races...'
IF OBJECT_ID('dbo.Race', 'U') IS NOT NULL
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
CREATE TABLE #Verification (TableName VARCHAR(100), NombreLignes INT);

IF OBJECT_ID('dbo.Distribution_Nourriture', 'U') IS NOT NULL
    INSERT INTO #Verification SELECT 'Distribution_Nourriture', COUNT(*) FROM Distribution_Nourriture;
IF OBJECT_ID('dbo.Mortalite', 'U') IS NOT NULL
    INSERT INTO #Verification SELECT 'Mortalite', COUNT(*) FROM Mortalite;
IF OBJECT_ID('dbo.VenteOeuf', 'U') IS NOT NULL
    INSERT INTO #Verification SELECT 'VenteOeuf', COUNT(*) FROM VenteOeuf;
IF OBJECT_ID('dbo.Oeuf', 'U') IS NOT NULL
    INSERT INTO #Verification SELECT 'Oeuf', COUNT(*) FROM Oeuf;
IF OBJECT_ID('dbo.Incubation', 'U') IS NOT NULL
    INSERT INTO #Verification SELECT 'Incubation', COUNT(*) FROM Incubation;
IF OBJECT_ID('dbo.Croissance', 'U') IS NOT NULL
    INSERT INTO #Verification SELECT 'Croissance', COUNT(*) FROM Croissance;
IF OBJECT_ID('dbo.Lot', 'U') IS NOT NULL
    INSERT INTO #Verification SELECT 'Lot', COUNT(*) FROM Lot;
IF OBJECT_ID('dbo.Race', 'U') IS NOT NULL
    INSERT INTO #Verification SELECT 'Race', COUNT(*) FROM Race;

SELECT * FROM #Verification;
DROP TABLE #Verification;

-- On valide tous les changements d'un coup
PRINT 'Nettoyage termine avec succes!'
COMMIT;
GO
