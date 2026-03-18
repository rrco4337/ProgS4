-- Création de la base de données
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'elevage')
    CREATE DATABASE elevage;
GO

USE elevage;
GO

IF OBJECT_ID('dbo.Race', 'U') IS NULL
BEGIN
    CREATE TABLE Race (
        id_race INT IDENTITY(1,1) PRIMARY KEY,
        nom_race VARCHAR(50) NOT NULL,
        pu_sakafo_g DECIMAL(10,2), 
        pv_g DECIMAL(10,2),       
        pv_oeuf DECIMAL(10,2),    
        semaine_debut_ponte INT,
        duree_incubation INT
    );
END
GO

IF OBJECT_ID('dbo.Lot', 'U') IS NULL
BEGIN
    CREATE TABLE Lot (
        id_lot INT IDENTITY(1,1) PRIMARY KEY,
        id_race INT NOT NULL,
        date_entree DATE,
        nombre_initial INT,
        cout_achat DECIMAL(12,2),
        CONSTRAINT FK_Lot_Race FOREIGN KEY (id_race) REFERENCES Race(id_race)
    );
END
GO

IF OBJECT_ID('dbo.Croissance', 'U') IS NULL
BEGIN
    CREATE TABLE Croissance (
        id_croissance INT IDENTITY(1,1) PRIMARY KEY,
        id_race INT NOT NULL,
        semaine INT,
        gain_poids INT,
        nourriture INT,
        CONSTRAINT FK_Croissance_Race FOREIGN KEY (id_race) REFERENCES Race(id_race)
    );
END
GO

IF OBJECT_ID('dbo.Distribution_Nourriture', 'U') IS NULL
BEGIN
    CREATE TABLE Distribution_Nourriture (
        id_distribution INT IDENTITY(1,1) PRIMARY KEY,
        id_lot INT NOT NULL,
        date_distribution DATE,
        quantite INT,
        CONSTRAINT FK_Distribution_Lot FOREIGN KEY (id_lot) REFERENCES Lot(id_lot)
    );
END
GO

IF OBJECT_ID('dbo.Oeuf', 'U') IS NULL
BEGIN
    CREATE TABLE Oeuf (
        id_oeuf INT IDENTITY(1,1) PRIMARY KEY,
        id_lot INT NOT NULL,
        date_recolte DATE,
        nombre INT,
        CONSTRAINT FK_Oeuf_Lot FOREIGN KEY (id_lot) REFERENCES Lot(id_lot)
    );
END
GO

IF OBJECT_ID('dbo.Incubation', 'U') IS NULL
BEGIN
    CREATE TABLE Incubation (
        id_incubation INT IDENTITY(1,1) PRIMARY KEY,
        id_oeuf INT NOT NULL,
        date_debut DATE,
        nombre_oeufs INT,
        CONSTRAINT FK_Incubation_Oeuf FOREIGN KEY (id_oeuf) REFERENCES Oeuf(id_oeuf)
    );
END
GO

IF OBJECT_ID('dbo.Mortalite', 'U') IS NULL
BEGIN
    CREATE TABLE Mortalite (
        id_mortalite INT IDENTITY(1,1) PRIMARY KEY,
        id_lot INT NOT NULL,
        date_mort DATE,
        nombre INT,
        CONSTRAINT FK_Mortalite_Lot FOREIGN KEY (id_lot) REFERENCES Lot(id_lot)
    );
END
GO

IF COL_LENGTH('dbo.Lot', 'id_incubation') IS NULL
BEGIN
    ALTER TABLE Lot ADD id_incubation INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_Lot_Incubation'
)
BEGIN
    ALTER TABLE Lot
    ADD CONSTRAINT FK_Lot_Incubation
    FOREIGN KEY (id_incubation)
    REFERENCES Incubation(id_incubation);
END
GO

-- Pas de donnees d'exemple ici
-- Utiliser insert_test_data.sql pour inserer les vraies donnees

