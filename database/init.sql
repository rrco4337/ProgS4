CREATE TABLE Race (
    id_race INT IDENTITY(1,1) PRIMARY KEY,
    nom_race VARCHAR(50) NOT NULL,
    pu_sakafo_g DECIMAL(10,2), 
    pv_g DECIMAL(10,2),       
    pv_oeuf DECIMAL(10,2),    
    semaine_debut_ponte INT,
    duree_incubation INT
);
CREATE TABLE Lot (
    id_lot INT IDENTITY(1,1) PRIMARY KEY,
    id_race INT NOT NULL,
    date_entree DATE,
    nombre_initial INT,
    cout_achat DECIMAL(12,2),

    FOREIGN KEY (id_race) REFERENCES Race(id_race)
);
CREATE TABLE Croissance (
    id_croissance INT IDENTITY(1,1) PRIMARY KEY,
    id_race INT NOT NULL,
    semaine INT,
    gain_poids INT,
    nourriture INT,

    FOREIGN KEY (id_race) REFERENCES Race(id_race)
);
CREATE TABLE Distribution_Nourriture (
    id_distribution INT IDENTITY(1,1) PRIMARY KEY,
    id_lot INT NOT NULL,
    date_distribution DATE,
    quantite INT,

    FOREIGN KEY (id_lot) REFERENCES Lot(id_lot)
);
CREATE TABLE Oeuf (
    id_oeuf INT IDENTITY(1,1) PRIMARY KEY,
    id_lot INT NOT NULL,
    date_recolte DATE,
    nombre INT,

    FOREIGN KEY (id_lot) REFERENCES Lot(id_lot)
);
CREATE TABLE Incubation (
    id_incubation INT IDENTITY(1,1) PRIMARY KEY,
    id_oeuf INT NOT NULL,
    date_debut DATE,
    nombre_oeufs INT,

    FOREIGN KEY (id_oeuf) REFERENCES Oeuf(id_oeuf)
);
CREATE TABLE Mortalite (
    id_mortalite INT IDENTITY(1,1) PRIMARY KEY,
    id_lot INT NOT NULL,
    date_mort DATE,
    nombre INT,

    FOREIGN KEY (id_lot) REFERENCES Lot(id_lot)
);
ALTER TABLE Lot
ADD id_incubation INT NULL;

ALTER TABLE Lot
ADD CONSTRAINT FK_Lot_Incubation
FOREIGN KEY (id_incubation)
REFERENCES Incubation(id_incubation);

-- Insertion de données d'exemple

-- Insertion des races
INSERT INTO Race (nom_race, pu_sakafo_g, pv_g, pv_oeuf, semaine_debut_ponte, duree_incubation) VALUES
('Race R1', 0.50, 5.00, 300.00, 20, 21),
('Race R2', 0.55, 5.50, 320.00, 22, 21),
('Race R3', 0.48, 4.80, 280.00, 18, 21);

-- Insertion des modèles de croissance pour Race R1
INSERT INTO Croissance (id_race, semaine, gain_poids, nourriture) VALUES
(1, 0, 150, 0),      -- Poids initial du poussin
(1, 1, 30, 60),
(1, 2, 40, 60),
(1, 3, 50, 80),
(1, 4, 60, 100),
(1, 5, 70, 120),
(1, 6, 80, 140),
(1, 7, 90, 160),
(1, 8, 100, 180),
(1, 9, 110, 200),
(1, 10, 120, 220);

-- Insertion des modèles de croissance pour Race R2
INSERT INTO Croissance (id_race, semaine, gain_poids, nourriture) VALUES
(2, 0, 140, 0),
(2, 1, 35, 65),
(2, 2, 45, 65),
(2, 3, 55, 85),
(2, 4, 65, 105),
(2, 5, 75, 125),
(2, 6, 85, 145),
(2, 7, 95, 165),
(2, 8, 105, 185),
(2, 9, 115, 205),
(2, 10, 125, 225);

-- Insertion des modèles de croissance pour Race R3
INSERT INTO Croissance (id_race, semaine, gain_poids, nourriture) VALUES
(3, 0, 160, 0),
(3, 1, 28, 58),
(3, 2, 38, 58),
(3, 3, 48, 78),
(3, 4, 58, 98),
(3, 5, 68, 118),
(3, 6, 78, 138),
(3, 7, 88, 158),
(3, 8, 98, 178),
(3, 9, 108, 198),
(3, 10, 118, 218);

-- Insertion de lots d'exemple
INSERT INTO Lot (id_race, date_entree, nombre_initial, cout_achat) VALUES
(1, '2026-01-15', 100, 15000.00),
(1, '2026-02-01', 150, 22500.00),
(2, '2026-01-20', 120, 18000.00),
(3, '2026-02-10', 80, 12000.00);

