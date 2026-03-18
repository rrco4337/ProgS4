-- Nettoyage complet de la base SQL Server "elevage"
-- Ce script vide TOUTES les tables utilisateur de tous les schemas,
-- puis remet a zero les colonnes IDENTITY.

USE elevage;
GO

-- Options requises pour les DELETE avec colonnes calculees et index
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

PRINT 'Debut du nettoyage complet de la base elevage...';

-- 1) Desactiver temporairement toutes les contraintes FK/CHECK
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql +=
    N'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + N'.' + QUOTENAME(t.name) + N' NOCHECK CONSTRAINT ALL;' + CHAR(10)
FROM sys.tables t
WHERE t.is_ms_shipped = 0;

EXEC sp_executesql @sql;

-- 2) Supprimer toutes les lignes de toutes les tables utilisateur
SET @sql = N'';

SELECT @sql +=
    N'DELETE FROM ' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + N'.' + QUOTENAME(t.name) + N';' + CHAR(10)
FROM sys.tables t
WHERE t.is_ms_shipped = 0;

EXEC sp_executesql @sql;

-- 3) Reinitialiser toutes les colonnes IDENTITY
SET @sql = N'';

SELECT @sql +=
    N'DBCC CHECKIDENT (''' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + N'.' + QUOTENAME(t.name) + N''', RESEED, 0) WITH NO_INFOMSGS;' + CHAR(10)
FROM sys.tables t
WHERE t.is_ms_shipped = 0
  AND OBJECTPROPERTY(t.object_id, 'TableHasIdentity') = 1;

IF LEN(@sql) > 0
    EXEC sp_executesql @sql;

-- 4) Reactiver et revalider les contraintes
SET @sql = N'';

SELECT @sql +=
    N'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + N'.' + QUOTENAME(t.name) + N' WITH CHECK CHECK CONSTRAINT ALL;' + CHAR(10)
FROM sys.tables t
WHERE t.is_ms_shipped = 0;

EXEC sp_executesql @sql;

COMMIT;

PRINT 'Nettoyage complet termine avec succes.';
GO
