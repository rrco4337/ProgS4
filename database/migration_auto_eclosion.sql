-- Migration pour l'éclosion automatique
-- Date: 2026-03-12
-- Description: Ajouter les champs nécessaires pour l'éclosion automatique

-- 1. Ajouter la colonne date_eclosion_reelle à la table Incubation
IF OBJECT_ID('dbo.Incubation', 'U') IS NOT NULL
AND NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Incubation' 
    AND COLUMN_NAME = 'date_eclosion_reelle'
)
BEGIN
    ALTER TABLE Incubation 
    ADD date_eclosion_reelle DATE NULL;
    PRINT 'Colonne date_eclosion_reelle ajoutée à Incubation';
END
ELSE
BEGIN
    PRINT 'Colonne date_eclosion_reelle déjà présente dans Incubation';
END

-- 2. Ajouter la colonne id_incubation à la table Lot (pour référencer l'incubation d'origine)
IF OBJECT_ID('dbo.Lot', 'U') IS NOT NULL
AND NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Lot' 
    AND COLUMN_NAME = 'id_incubation'
)
BEGIN
    ALTER TABLE Lot 
    ADD id_incubation INT NULL;
    PRINT 'Colonne id_incubation ajoutée à Lot';
END
ELSE
BEGIN
    PRINT 'Colonne id_incubation déjà présente dans Lot';
END

-- 3. Ajouter la contrainte de clé étrangère pour id_incubation (optionnelle)
IF OBJECT_ID('dbo.Lot', 'U') IS NOT NULL
AND OBJECT_ID('dbo.Incubation', 'U') IS NOT NULL
AND NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_NAME = 'FK_Lot_Incubation'
)
BEGIN
    ALTER TABLE Lot 
    ADD CONSTRAINT FK_Lot_Incubation 
    FOREIGN KEY (id_incubation) REFERENCES Incubation(id_incubation);
    PRINT 'Contrainte FK_Lot_Incubation ajoutée';
END
ELSE
BEGIN
    PRINT 'Contrainte FK_Lot_Incubation déjà présente';
END

-- 4. Vérifier que la colonne statut de Incubation peut supporter 'eclot_auto'
-- (Dans la plupart des cas, elle devrait déjà le supporter si c'est un VARCHAR)
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Incubation' 
    AND COLUMN_NAME = 'statut'
)
BEGIN
    PRINT 'Colonne statut d''Incubation prête pour eclot_auto';
    PRINT 'Valeurs de statut possibles : en_cours, eclot, eclot_auto';
END

-- 5. Mettre à jour les incubations existantes qui sont écloses manuellement
IF OBJECT_ID('dbo.Incubation', 'U') IS NOT NULL
AND COL_LENGTH('dbo.Incubation', 'statut') IS NOT NULL
AND COL_LENGTH('dbo.Incubation', 'date_eclosion_reelle') IS NOT NULL
BEGIN
    EXEC(N'
        UPDATE Incubation 
        SET date_eclosion_reelle = CAST(GETDATE() AS DATE)
        WHERE statut = ''eclot'' 
        AND date_eclosion_reelle IS NULL;
    ');
END

PRINT 'Migration terminée avec succès !';
PRINT 'Nouvelles fonctionnalités activées :';
PRINT '- Éclosion automatique basée sur duree_incubation de la race';
PRINT '- Suivi de la date réelle d''éclosion';
PRINT '- Référence de l''incubation d''origine dans les lots';
PRINT '- Distinction entre éclosion manuelle et automatique';