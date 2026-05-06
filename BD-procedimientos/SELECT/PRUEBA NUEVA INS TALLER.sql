USE GESTION_TALLER;

IF OBJECT_ID('INSCRIBIR_EL_TALLER', 'P') IS NOT NULL
    DROP PROCEDURE INSCRIBIR_EL_TALLER;
GO
-- Actualmente se pueden meter multiples talleristas, la idea es simple de esto, pueden inscribir el taller a su vez que meten talelrista por la id profesor, haciendo el truco del xml podemos tomar id profesor y ponerle ids
-- @id_profesor = '157,156,155' , de esta forma tiene que llegar los datos, sin espacios de lo contrario puede y va a fallar, la cantidad de ids que pueden entrar pueden ser todas las que uno quiero , se separaran por lo
-- cual no tenemos problemas con esto, el tema esta ahora de poder poner multiples profes en el backend con frontend, ademas de poder hacerlo bien, otro detalle, las ids de los profe deben estar ya creadas
CREATE PROCEDURE INSCRIBIR_EL_TALLER
    @ID_PROFESOR         VARCHAR(MAX),
    @YEAR_PROCESO        INT,
    @ID_CATEGORIA        INT,
    @NOMBRE_TALLER       VARCHAR(80),
    @OBJETIVO_TALLER     VARCHAR(500),
    @FEC_INICIO          DATE,
    @FEC_TERMINO         DATE,
    @NRO_MINUTOS         NUMERIC(10),
    @NRO_CLASES_ANUAL    NUMERIC(10),
    @HORAS_TOTALES       NUMERIC(10),
    @ID_ESTADO_TALLER    INT,
    @OBSERVACION         VARCHAR(50),
    @LUGAR               VARCHAR(100),
    @MINIMO_ESTUDIANTE   INT,
    @MAXIMO_ESTUDIANTE   INT,
    @REQUISITO           VARCHAR(500),
    @EDAD_MINIMA         INT,
    @EDAD_MAXIMA         INT,
    @MATERIAL            VARCHAR(500),
    @IND_TIPO_TALLER     INT,
    @AUD_USUARIO_INGRESO VARCHAR(20)

AS 
BEGIN
SET NOCOUNT ON;

    INSERT INTO SGT_TALLER 
        (YEAR_PROCESO,
        ID_CATEGORIA,
        NOMBRE_TALLER,
        ID_DEPARTAMENTO,
        OBJETIVO_TALLER,
        FEC_INICIO,
        FEC_TERMINO,
        NRO_MINUTOS,
        NRO_CLASES_ANUAL,
        HORAS_TOTALES,
        ID_ESTADO_TALLER,
        FEC_ESTADO_TALLER,
        OBSERVACION,
        LUGAR,
        MINIMO_ESTUDIANTE,
        MAXIMO_ESTUDIANTE,
        REQUISITO,
        EDAD_MINIMA,
        EDAD_MAXIMA,
        MATERIAL,
        IND_TIPO_TALLER,
        AUD_USUARIO_INGRESO,
        AUD_FEC_INGRESO,
        AUD_USUARIO_MODIFICA,
        AUD_FEC_MODIFICA)

    VALUES (@YEAR_PROCESO,@ID_CATEGORIA,@NOMBRE_TALLER,
        169,
        COALESCE(NULLIF(@OBJETIVO_TALLER, ''), '-'),
        @FEC_INICIO,
        @FEC_TERMINO,
        @NRO_MINUTOS,
        @NRO_CLASES_ANUAL,
        @HORAS_TOTALES,
        1,
        GETDATE(),
        COALESCE(NULLIF(@OBSERVACION, ''), '-'),
        COALESCE(NULLIF(@LUGAR, ''), '-'),
        @MINIMO_ESTUDIANTE,
        @MAXIMO_ESTUDIANTE,
        COALESCE(NULLIF(@REQUISITO, ''), '-'),
        @EDAD_MINIMA,
        @EDAD_MAXIMA,
        COALESCE(NULLIF(@MATERIAL, ''), '-'),
        CASE WHEN @IND_TIPO_TALLER IN (1,2) THEN @IND_TIPO_TALLER ELSE 0 END,
        COALESCE(NULLIF(@AUD_USUARIO_INGRESO, ''), 'SISTEMA'),
        GETDATE(),
        COALESCE(NULLIF(@AUD_USUARIO_INGRESO, ''), 'SISTEMA'),
        GETDATE())

    DECLARE @ID_TALLER INT = SCOPE_IDENTITY();

    IF @ID_PROFESOR IS NOT NULL AND LEN(@ID_PROFESOR) > 0
    BEGIN
        DECLARE @XML XML = CAST('<root><id>' + REPLACE(@ID_PROFESOR, ',', '</id><id>') + '</id></root>' AS XML);

        INSERT INTO SGT_GESTION_TALLER
            (ID_TALLER,
            ID_PROFESOR,
            YEAR_PROCESO,
            AUD_USUARIO_INGRESO,
            AUD_FEC_INGRESO,
            AUD_USUARIO_MODIFICA,
            AUD_FEC_MODIFICA)

        SELECT 
            @ID_TALLER,
            T.c.value('.','INT'),
            @YEAR_PROCESO,
            @AUD_USUARIO_INGRESO,
            GETDATE(),
            @AUD_USUARIO_INGRESO,
            GETDATE()
        FROM @XML.nodes('/root/id') AS T(c)
        INNER JOIN SGT_PROFESOR P ON P.ID_PROFESOR = T.c.value('.','INT'); 

    END

    SELECT 'El taller ha sido ingresado al sistema' AS RESULTADO;

END;