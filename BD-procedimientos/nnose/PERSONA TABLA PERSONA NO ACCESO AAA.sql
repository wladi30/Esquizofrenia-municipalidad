USE GESTION_TALLER;

SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%PERSONA%'
   OR COLUMN_NAME LIKE '%NOMBRE%'
   OR COLUMN_NAME LIKE '%APELLIDO%'
   OR COLUMN_NAME LIKE '%RUT%'
   OR COLUMN_NAME LIKE '%DOCUMENTO%'
ORDER BY TABLE_NAME, ORDINAL_POSITION;

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('SGT_ESTUDIANTE'), COLUMN_NAME, 'IsIdentity') AS IsIdentity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SGT_ESTUDIANTE'
ORDER BY ORDINAL_POSITION;

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('SGT_PROFESOR'), COLUMN_NAME, 'IsIdentity') AS IsIdentity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SGT_PROFESOR'
ORDER BY ORDINAL_POSITION;

SELECT 
    fk.name AS FK_Name,
    tp.name AS Parent_Table,
    tr.name AS Ref_Table,
    cp.name AS Parent_Column,
    cr.name AS Ref_Column
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
INNER JOIN sys.columns cp ON fkc.parent_column_id = cp.column_id AND fkc.parent_object_id = cp.object_id
INNER JOIN sys.columns cr ON fkc.referenced_column_id = cr.column_id AND fkc.referenced_object_id = cr.object_id
WHERE tr.name IN ('SGT_ESTUDIANTE', 'SGT_PROFESOR', 'SGT_PERSONA')
   OR tp.name IN ('SGT_ESTUDIANTE', 'SGT_PROFESOR', 'SGT_PERSONA')
ORDER BY tp.name, fk.name;


IF OBJECT_ID('SGT_PERSONA', 'U') IS NOT NULL
BEGIN
    SELECT 'EXISTE SGT_PERSONA' as Estado;
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'SGT_PERSONA'
    ORDER BY ORDINAL_POSITION;

    SELECT TOP 10 * FROM SGT_PERSONA;
END
ELSE
BEGIN
    SELECT 'NO EXISTE SGT_PERSONA' as Estado; --efectivamente no tengo acceso a esta madre, y si le tiro un breach?
END

SELECT 
    OBJECT_NAME(object_id) AS Tabla, --no seria buena idea lo del breach pero al menos se que las tablas son identify, puedo trabajar con eso
    name AS Columna,
    is_identity AS Es_Identity
FROM sys.columns 
WHERE object_id IN (
    OBJECT_ID('SGT_ESTUDIANTE'),
    OBJECT_ID('SGT_PROFESOR')
)
AND is_identity = 1;