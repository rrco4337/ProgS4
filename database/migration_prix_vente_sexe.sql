-- Migration : prix de vente differencie par sexe
-- Femelle 15 Ar/g, Male 20 Ar/g

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'pv_g_femelle' AND Object_ID = OBJECT_ID('Race'))
    ALTER TABLE Race ADD pv_g_femelle DECIMAL(10,2) NOT NULL DEFAULT 15.00;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = 'pv_g_male' AND Object_ID = OBJECT_ID('Race'))
    ALTER TABLE Race ADD pv_g_male DECIMAL(10,2) NOT NULL DEFAULT 20.00;

-- Retro-compatibilite : si pv_g existe deja, on l'utilise comme base femelle
IF COL_LENGTH('Race', 'pv_g_femelle') IS NOT NULL
    EXEC('UPDATE Race SET pv_g_femelle = ISNULL(pv_g, 15.00) WHERE pv_g_femelle IS NULL OR pv_g_femelle = 0;');

IF COL_LENGTH('Race', 'pv_g_male') IS NOT NULL
    EXEC('UPDATE Race SET pv_g_male = 20.00 WHERE pv_g_male IS NULL OR pv_g_male = 0;');

SELECT 'Migration prix de vente par sexe terminee !' AS Message;
