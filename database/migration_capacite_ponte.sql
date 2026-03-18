-- Migration pour ajouter la capacité de ponte des races
-- Date: 2026-03-12
-- Description: Ajouter la colonne capacite_ponte à la table Race

-- Ajouter la colonne capacite_ponte à la table Race
IF NOT EXISTS (
	SELECT * FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_NAME = 'Race'
	AND COLUMN_NAME = 'capacite_ponte'
)
BEGIN
	ALTER TABLE Race
	ADD capacite_ponte INT CONSTRAINT DF_Race_capacite_ponte DEFAULT 300 NOT NULL;
	PRINT 'Colonne capacite_ponte ajoutée à Race';
END
ELSE
BEGIN
	PRINT 'Colonne capacite_ponte déjà présente dans Race';
END

-- Mettre à jour quelques valeurs par défaut selon les races communes
UPDATE Race SET capacite_ponte = 280 WHERE nom_race LIKE '%Poule rousse%' OR nom_race LIKE '%Sussex%';
UPDATE Race SET capacite_ponte = 250 WHERE nom_race LIKE '%Brahma%' OR nom_race LIKE '%Cochin%';
UPDATE Race SET capacite_ponte = 320 WHERE nom_race LIKE '%Leghorn%' OR nom_race LIKE '%Rhode Island%';
UPDATE Race SET capacite_ponte = 200 WHERE nom_race LIKE '%Soie%' OR nom_race LIKE '%Ornement%';

-- Afficher le résultat
SELECT 'Migration capacité de ponte terminée !' AS Message;
SELECT 'Nouvelle fonctionnalité : Calcul du potentiel de production par lot' AS Info;
SELECT 'Formule : nb_poules × capacite_ponte = production_maximale_oeufs' AS Formule;