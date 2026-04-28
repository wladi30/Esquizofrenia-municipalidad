USE GESTION_TALLER;
GO

INSERT INTO SGT_PERSONA_FUNCIONARIO
           (RUT_F
           ,DV_F
           ,NOMBRE_F
           ,APELLIDO_PATERNO_F
           ,APELLIDO_MATERNO_F
           ,FEC_NACIMIENTO_F
           ,EDAD_F
           ,GENERO_F
           ,NRO_CALLE_F
           ,NRO_BLOCK_F
           ,NRO_DPTO_F
           ,CALLE_F
           ,VILLA_F
           ,ID_PAIS_F
           ,ID_COMUNA_F
           ,TELEFONO_F
           ,CORREO_ELECTRONICO_F
           ,NOMBRE_CONTACTO_F
           ,TELEFONO_CONTACTO_F
           ,CORREO_CONTACTO_F
           ,OBSERVACION_F
           ,ID_USUARIO_F
           ,PASSWORD_F)
     VALUES
           (12345678
           ,9
           ,'WLADIMIR'
           ,'MELO'
           ,'CORTES'
           ,GETDATE()
           ,75
           ,69
           ,'LA CALLE DE MI CASA'
           ,'BLOCKEADO'
           ,'1991'
           ,'LA EZQUINA'
           ,'VILLA VICENCIO'
           ,1
           ,1
           ,'+56 9 8765 4321'
           ,'TEST@prueba.cl'
           ,'nao nao'
           ,'+56 9 9587 2345'
           ,'PRUEBA@test.cl'
           ,'hola'
           ,'Usuario'
           ,'123')
GO


