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

