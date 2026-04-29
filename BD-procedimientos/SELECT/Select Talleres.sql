USE GESTION_TALLER;

IF OBJECT_ID('VER_TALLERES', 'P') IS NOT NULL
    DROP PROCEDURE VER_TALLERES;
GO

CREATE PROCEDURE VER_TALLERES -- vamos a añadirle los datos del tallerista
    @ID_TALLER NUMERIC(10)
AS 
BEGIN
    SELECT 
        A.ID_TALLER AS 'ID del taller',
        A.YEAR_PROCESO AS 'Año del proceso',
        A.ID_CATEGORIA AS 'ID de la categoria',
        A.NOMBRE_TALLER AS 'Nombre del taller',
        A.ID_DEPARTAMENTO AS 'ID del departamento',
        A.OBJETIVO_TALLER AS 'Objetivo del taller',
        A.FEC_INICIO AS 'Fecha de inicio',
        A.FEC_TERMINO AS 'Fecha de termino',
        A.NRO_MINUTOS AS 'Numero de minutos',
        A.NRO_CLASES_ANUAL AS 'Numero de clases anuales',
        A.HORAS_TOTALES AS 'Horas totales',
        A.ID_ESTADO_TALLER AS 'ID del estado del taller',
        A.FEC_ESTADO_TALLER AS 'Fecha del estado del taller',
        A.OBSERVACION AS 'Observacion',
        A.LUGAR AS 'Lugar',
        A.MINIMO_ESTUDIANTE AS 'Minimo de estudiantes',
        A.MAXIMO_ESTUDIANTE AS 'Maximo de estudiantes',
        ISNULL((
                SELECT COUNT(*) 
                FROM SGT_INTEGRANTE_TALLER E 
                WHERE E.ID_TALLER = A.ID_TALLER 
                AND E.IND_ESTADO_INTEGRANTE = 1
            ), 0) AS 'personas_inscritas',
        A.REQUISITO AS 'Requisitos',
        A.EDAD_MINIMA AS 'Edad minima',
        A.EDAD_MAXIMA AS 'Edad maxima',
        A.MATERIAL AS 'Materiales',
        A.IND_TIPO_TALLER AS 'Tipo de taller',
        I.ID_PROFESOR AS 'ID del Profesor',
        O.NOMBRE_PERSONA AS 'Nombre del Profesor',
        O.APELLIDO_PATERNO AS 'Apellido Paterno',
        O.APELLIDO_MATERNO AS 'Apellido Materno',
        O.EDAD AS 'Edad',
        O.GENERO AS 'Genero',
        I.PROFESION AS 'Profesion',
        O.IND_ACTIVO AS 'Indicador de Actividad',
        A.AUD_USUARIO_INGRESO AS 'Usuario que ingreso el taller',
        A.AUD_FEC_INGRESO AS 'Fecha del ingreso',
        A.AUD_USUARIO_MODIFICA AS 'Usuario que hizo la ultima modificación',
        A.AUD_FEC_MODIFICA AS 'Fecha de la ultima modificación'
    FROM SGT_TALLER A
    LEFT JOIN SGT_GESTION_TALLER E ON A.ID_TALLER = E.ID_TALLER
    LEFT JOIN SGT_PROFESOR I ON E.ID_PROFESOR = I.ID_PROFESOR
    LEFT JOIN SGT_PERSONA_TALLER O ON I.ID_PERSONA = O.ID_PERSONA
    WHERE A.ID_ESTADO_TALLER IN (1,2,3,4)
      AND A.ID_TALLER = @ID_TALLER
END;
GO