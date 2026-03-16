-- Migration : Éclosion avec sexage et œufs pourris
-- Date: 2026-03-16

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'oeufs_pourris' AND Object_ID = OBJECT_ID('Incubation'))
    ALTER TABLE Incubation ADD oeufs_pourris INT DEFAULT 0 NOT NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'pourcentage_male' AND Object_ID = OBJECT_ID('Incubation'))
    ALTER TABLE Incubation ADD pourcentage_male DECIMAL(5,2) DEFAULT 50.00 NOT NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'nb_femelles' AND Object_ID = OBJECT_ID('Lot'))
    ALTER TABLE Lot ADD nb_femelles INT NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'nb_males' AND Object_ID = OBJECT_ID('Lot'))
    ALTER TABLE Lot ADD nb_males INT NULL;

SELECT 'Migration sexage terminée !' AS Message;
