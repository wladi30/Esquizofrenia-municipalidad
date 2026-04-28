    use GESTION_TALLER;
--explicacion de que sucede aqui, este procedure deberia servir para añadir datos a la tabla de persona que cree, estudiante y profesor hacen uso de la id persona pero no tengo acceso
--asi que con esto ademas de tabla deberia funcionar todo bien, gracias a esta madr se deberia crear tanto estudiantes como profesor para despues darles usos a sus nombres , rut , etc

IF OBJECT_ID('REGISTRAR_PERSONA', 'P') IS NOT NULL --util
    DROP PROCEDURE REGISTRAR_PERSONA;
GO

CREATE PROCEDURE REGISTRAR_PERSONA
    @RUT_PERSONA NUMERIC (10,0),
    @DV_PERSONA CHAR (1),
    @PASAPORTE VARCHAR (20) = NULL,
    @NOMBRE_PERSONA VARCHAR (50),
    @APELLIDO_PATERNO VARCHAR (50),
    @APELLIDO_MATERNO VARCHAR (50),
    @FEC_NACIMIENTO DATE,
    @GENERO CHAR (1),
    @TELEFONO VARCHAR (20),
    @CORREO_ELECTRONICO VARCHAR (100),
    @CONTRASENA VARCHAR (255),
    @TIPO_USUARIO VARCHAR (20) = 'ESTUDIANTE',
    @CALLE VARCHAR (100),
    @NRO_CALLE VARCHAR (10),
    @ID_COMUNA INT,
    @ID_PAIS INT
    

    AS BEGIN
        SET NOCOUNT ON;

        DECLARE @EDAD INT
        SET @EDAD = DATEDIFF(YEAR, @FEC_NACIMIENTO, GETDATE());

        DECLARE @CONTRASENA_HASH VARCHAR (255)
        SET @CONTRASENA_HASH = CONVERT(VARCHAR(255), HASHBYTES('SHA2_256', @CONTRASENA));

        BEGIN TRY -- proxima vez que salga todo en rojo recuerda cerrar esta madre y volverla a abrir wladi esta cosa rancia le tiende a pasar eso
            INSERT INTO SGT_PERSONA_TALLER (RUT_PERSONA, DV_PERSONA, PASAPORTE, NOMBRE_PERSONA, APELLIDO_PATERNO, APELLIDO_MATERNO, FEC_NACIMIENTO, EDAD, GENERO, TELEFONO, CORREO_ELECTRONICO, CONTRASENA_HASH, TIPO_USUARIO, CALLE, NRO_CALLE, ID_COMUNA, ID_PAIS)
            VALUES (@RUT_PERSONA, @DV_PERSONA, @PASAPORTE, @NOMBRE_PERSONA, @APELLIDO_PATERNO, @APELLIDO_MATERNO, @FEC_NACIMIENTO, @EDAD, @GENERO, @TELEFONO, @CORREO_ELECTRONICO, @CONTRASENA_HASH, @TIPO_USUARIO, @CALLE, @NRO_CALLE, @ID_COMUNA, @ID_PAIS);

            DECLARE @ID_PERSONA NUMERIC(10,0);
            SET @ID_PERSONA = SCOPE_IDENTITY();

        --AQUI USUARIO SI DETECTA QUE ES ESTUDIANTE ASE ELLO Y AQUELLO BLASH BLUSH BOOOM EL SOL SE JUNTA CON LA LUNA Y BOOM
            IF @TIPO_USUARIO ='ESTUDIANTE'
            BEGIN
                INSERT INTO SGT_ESTUDIANTE (ID_PERSONA,AUD_USUARIO_INGRESO,AUD_FEC_INGRESO,AUD_USUARIO_MODIFICA,AUD_FEC_MODIFICA)
                VALUES (@ID_PERSONA, 'SISTEMA', GETDATE(), 'SISTEMA', '1900-01-01 00:00:00.000');
            END

            IF @TIPO_USUARIO ='PROFESOR'
            BEGIN
                INSERT INTO SGT_PROFESOR (ID_PERSONA,PROFESION,RESUMEN_CURRICULAR,AUD_USUARIO_INGRESO,AUD_FEC_INGRESO,AUD_USUARIO_MODIFICA,AUD_FEC_MODIFICA)
                VALUES (@ID_PERSONA, 'Por definir', 'Por definir', 'SISTEMA', GETDATE(), 'SISTEMA', GETDATE());
            END

            SELECT
                'exito' AS status, --le queria poner success por que cada vez mas me consume el js con flask
                'persona correctamente registrada' AS message,
                @ID_PERSONA AS id_persona,
                CASE @TIPO_USUARIO
                    WHEN 'ESTUDIANTE' 
                    THEN (SELECT ID_ESTUDIANTE FROM SGT_ESTUDIANTE WHERE ID_PERSONA = @ID_PERSONA)
                    WHEN 'PROFESOR' 
                    THEN (SELECT ID_PROFESOR FROM SGT_PROFESOR WHERE ID_PERSONA = @ID_PERSONA)
                ELSE NULL
            END AS id_rol;
        END TRY
        BEGIN CATCH
            SELECT
                'ERROR' AS status,
                ERROR_MESSAGE() AS message,
                NULL AS id_persona,
                NULL AS id_rol;
        END CATCH
END;
go