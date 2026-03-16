-- Migration : Gestion des oeufs
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Ajouter les colonnes manquantes à la table Incubation
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'date_eclosion_prevue' AND Object_ID = OBJECT_ID('Incubation'))
    ALTER TABLE Incubation ADD date_eclosion_prevue DATE NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'statut' AND Object_ID = OBJECT_ID('Incubation'))
    ALTER TABLE Incubation ADD statut VARCHAR(20) NOT NULL DEFAULT 'en_cours';
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'id_lot_resultat' AND Object_ID = OBJECT_ID('Incubation'))
BEGIN
    ALTER TABLE Incubation ADD id_lot_resultat INT;
END
GO

-- Ajouter la contrainte de clé étrangère (dans un batch séparé)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Incubation_LotResultat')
BEGIN
    ALTER TABLE Incubation ADD CONSTRAINT FK_Incubation_LotResultat
        FOREIGN KEY (id_lot_resultat) REFERENCES Lot(id_lot);
END
GO

-- Créer la table VenteOeuf si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VenteOeuf')
BEGIN
    CREATE TABLE VenteOeuf (
        id_vente        INT IDENTITY(1,1) PRIMARY KEY,
        id_lot          INT NOT NULL,
        date_vente      DATE NOT NULL,
        nombre_oeufs    INT NOT NULL,
        prix_unitaire   DECIMAL(10,2) NOT NULL,
        revenu_total    AS (nombre_oeufs * prix_unitaire) PERSISTED,
        FOREIGN KEY (id_lot) REFERENCES Lot(id_lot)
    );
END
GO