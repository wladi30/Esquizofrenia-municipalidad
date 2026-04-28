USE [GESTION_TALLER]
GO

INSERT INTO [dbo].[SGT_PERSONA_TALLER]
           ([RUT_PERSONA]
           ,[DV_PERSONA]
           ,[NOMBRE_PERSONA]
           ,[APELLIDO_PATERNO]
           ,[APELLIDO_MATERNO]
           ,[FEC_NACIMIENTO]
           ,[TELEFONO]
           ,[CORREO_ELECTRONICO]
           ,[ID_COMUNA]
           ,[ID_PAIS])
     VALUES
           (10000000
           ,'8'
           ,'WLADIMIR'
           ,'MELO'
           ,'CORTES'
           ,GETDATE()
           ,'+56 9 8765 4321'
           ,'PRUEBA@test.cl'
           ,0
           ,0)
GO


