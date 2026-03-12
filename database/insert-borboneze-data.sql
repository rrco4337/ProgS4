SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

-- Race
INSERT INTO Race (nom_race, pu_sakafo_g, pv_g, pv_oeuf, semaine_debut_ponte, duree_incubation)
VALUES ('borbonèze', 5.00, 15.00, 500.00, 11, NULL);

-- Croissance de la race borbonèze
INSERT INTO Croissance (id_race, semaine, gain_poids, nourriture) VALUES
(1, 0, 50, 0),
(1, 1, 20, 75),
(1, 2, 25, 80),
(1, 3, 30, 100),
(1, 4, 40, 150),
(1, 5, 80, 170),
(1, 6, 85, 190),
(1, 7, 100, 200),
(1, 8, 100, 250),
(1, 9, 90, 270),
(1, 10, 140, 290),
(1, 11, 200, 300),
(1, 12, 220, 370),
(1, 13, 265, 390),
(1, 14, 285, 350),
(1, 15, 300, 300),
(1, 16, 350, 450),
(1, 17, 400, 500),
(1, 18, 420, 400),
(1, 19, 430, 500),
(1, 20, 500, 500),
(1, 21, 530, 650),
(1, 22, 600, 600),
(1, 23, 400, 750),
(1, 24, 100, 750),
(1, 25, 0, 600);

-- Lot 1
INSERT INTO Lot (id_race, date_entree, nombre_initial, cout_achat)
VALUES (1, '2026-01-01', 500, 500.00);

-- Distribution de nourriture
INSERT INTO Distribution_Nourriture (id_lot, date_distribution, quantite) VALUES
(3, '2026-01-08', 75),
(3, '2026-01-15', 80),
(3, '2026-01-22', 100),
(3, '2026-01-29', 150),
(3, '2026-02-05', 170),
(3, '2026-02-12', 190),
(3, '2026-02-19', 200),
(3, '2026-02-26', 250),
(3, '2026-03-05', 270),
(3, '2026-03-12', 290),
(3, '2026-03-19', 300),
(3, '2026-03-26', 370),
(3, '2026-04-02', 390),
(3, '2026-04-09', 350),
(3, '2026-04-16', 300),
(3, '2026-04-23', 450),
(3, '2026-04-30', 500),
(3, '2026-05-07', 400),
(3, '2026-05-14', 500),
(3, '2026-05-21', 500),
(3, '2026-05-28', 650),
(3, '2026-06-04', 600),
(3, '2026-06-11', 750),
(3, '2026-06-18', 750),
(3, '2026-06-25', 600);

-- Mortalite
INSERT INTO Mortalite (id_lot, date_mort, nombre)
VALUES (3, '2026-02-01', 15);

-- Oeufs recoltes
INSERT INTO Oeuf (id_lot, date_recolte, nombre) VALUES
(3, '2026-02-02', 100),
(3, '2026-02-15', 150);