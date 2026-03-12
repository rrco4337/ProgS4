-- Script de nettoyage de la base de données
-- Supprime toutes les données en respectant les contraintes de clés étrangères

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

-- Désactiver les contraintes de clés étrangères temporairement
ALTER TABLE VenteOeuf NOCHECK CONSTRAINT ALL;
ALTER TABLE Incubation NOCHECK CONSTRAINT ALL;
ALTER TABLE Oeuf NOCHECK CONSTRAINT ALL;
ALTER TABLE Distribution_Nourriture NOCHECK CONSTRAINT ALL;
ALTER TABLE Mortalite NOCHECK CONSTRAINT ALL;
ALTER TABLE Lot NOCHECK CONSTRAINT ALL;
ALTER TABLE Croissance NOCHECK CONSTRAINT ALL;

-- Supprimer les données dans l'ordre des dépendances
DELETE FROM VenteOeuf;
DELETE FROM Incubation;
DELETE FROM Oeuf;
DELETE FROM Distribution_Nourriture;
DELETE FROM Mortalite;
DELETE FROM Lot;
DELETE FROM Croissance;
DELETE FROM Race;

-- Réactiver les contraintes de clés étrangères
ALTER TABLE VenteOeuf CHECK CONSTRAINT ALL;
ALTER TABLE Incubation CHECK CONSTRAINT ALL;
ALTER TABLE Oeuf CHECK CONSTRAINT ALL;
ALTER TABLE Distribution_Nourriture CHECK CONSTRAINT ALL;
ALTER TABLE Mortalite CHECK CONSTRAINT ALL;
ALTER TABLE Lot CHECK CONSTRAINT ALL;
ALTER TABLE Croissance CHECK CONSTRAINT ALL;

-- Réinitialiser les compteurs d'identité (optionnel)
DBCC CHECKIDENT ('Race', RESEED, 0);
DBCC CHECKIDENT ('Lot', RESEED, 0);
DBCC CHECKIDENT ('Croissance', RESEED, 0);
DBCC CHECKIDENT ('Distribution_Nourriture', RESEED, 0);
DBCC CHECKIDENT ('Oeuf', RESEED, 0);
DBCC CHECKIDENT ('Incubation', RESEED, 0);
DBCC CHECKIDENT ('Mortalite', RESEED, 0);
DBCC CHECKIDENT ('VenteOeuf', RESEED, 0);

PRINT 'Base de données nettoyée avec succès !';
