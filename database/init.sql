-- Script d'initialisation de la base de données
-- Ce script crée la base de données et une table d'exemple

-- Attendre que SQL Server soit prêt
WAITFOR DELAY '00:00:05';
GO

-- Créer la base de données si elle n'existe pas
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AppDatabase')
BEGIN
    CREATE DATABASE AppDatabase;
    PRINT 'Base de données AppDatabase créée avec succès';
END
GO

-- Utiliser la base de données
USE AppDatabase;
GO

-- Créer une table d'exemple
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Examples')
BEGIN
    CREATE TABLE Examples (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    PRINT 'Table Examples créée avec succès';
END
GO

-- Insérer des données d'exemple
IF NOT EXISTS (SELECT * FROM Examples)
BEGIN
    INSERT INTO Examples (name, description) VALUES 
        ('Exemple 1', 'Ceci est un premier exemple'),
        ('Exemple 2', 'Ceci est un deuxième exemple'),
        ('Exemple 3', 'Ceci est un troisième exemple');
    PRINT 'Données d''exemple insérées avec succès';
END
GO

PRINT 'Initialisation de la base de données terminée';
GO
