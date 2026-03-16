USE elevage;
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- On insere la race Borboneze
-- prix sakafo = 5 Ar/g, prix vente poulet = 15 Ar/g, prix oeuf = 500 Ar, incubation = 30 jours
INSERT INTO Race (nom_race, pu_sakafo_g, pv_g, pv_oeuf, semaine_debut_ponte, duree_incubation)
VALUES ('Borboneze', 5.00, 15.00, 500.00, 9, 30);
DECLARE @raceId INT = SCOPE_IDENTITY();

-- Modele de croissance de la race Borboneze
-- S0 = poids initial 50g, puis chaque semaine le gain de poids et la nourriture necessaire
INSERT INTO Croissance (id_race, semaine, gain_poids, nourriture) VALUES
(@raceId, 0,   50,    0),
(@raceId, 1,   20,   75),
(@raceId, 2,   25,   80),
(@raceId, 3,   30,  100),
(@raceId, 4,   40,  150),
(@raceId, 5,   80,  170),
(@raceId, 6,   85,  190),
(@raceId, 7,  100,  200),
(@raceId, 8,  100,  250),
(@raceId, 9,   90,  270),
(@raceId, 10, 140,  290),
(@raceId, 11, 200,  300),
(@raceId, 12, 220,  370),
(@raceId, 13, 265,  390),
(@raceId, 14, 285,  350),
(@raceId, 15, 300,  300),
(@raceId, 16, 350,  450),
(@raceId, 17, 400,  500),
(@raceId, 18, 420,  400),
(@raceId, 19, 430,  500),
(@raceId, 20, 500,  500),
(@raceId, 21, 530,  650),
(@raceId, 22, 600,  600),
(@raceId, 23, 400,  750),
(@raceId, 24, 100,  750),
(@raceId, 25,   0,  600);

-- Lot 1 : 500 poulets Borboneze, entree le 01/01/2026
INSERT INTO Lot (id_race, date_entree, nombre_initial, cout_achat)
VALUES (@raceId, '2026-01-01', 500, 500.00);
DECLARE @lotId INT = SCOPE_IDENTITY();

-- Mortalite : 15 morts le 01/02/2026
INSERT INTO Mortalite (id_lot, date_mort, nombre)
VALUES (@lotId, '2026-02-01', 15);

-- Recolte d'oeufs : 100 oeufs le 02/02/2026
INSERT INTO Oeuf (id_lot, date_recolte, nombre)
VALUES (@lotId, '2026-02-02', 100);

-- Recolte d'oeufs : 150 oeufs le 15/02/2026
INSERT INTO Oeuf (id_lot, date_recolte, nombre)
VALUES (@lotId, '2026-02-15', 150);

COMMIT;
GO
