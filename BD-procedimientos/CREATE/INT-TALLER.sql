USE [GESTION_TALLER]
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_FEC_MODIFICA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_MODIFICA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_FEC_INGRESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_INGRESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'OBSERVACION'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'FEC_RETIRO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'FEC_INSCRIPCION'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'IND_ESTADO_INTEGRANTE'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'YEAR_PROCESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'ID_ESTUDIANTE'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'ID_TALLER'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'ID_INTEGRANTE_TALLER'
GO

ALTER TABLE [dbo].[SGT_INTEGRANTE_TALLER] DROP CONSTRAINT [FK_SGT_INTEGRANTE_TALLER_SGT_TALLER]
GO

ALTER TABLE [dbo].[SGT_INTEGRANTE_TALLER] DROP CONSTRAINT [FK_SGT_ALUMNO_TALLER_SGT_ALUMNO]
GO

ALTER TABLE [dbo].[SGT_INTEGRANTE_TALLER] DROP CONSTRAINT [DF_SGT_INTEGRANTE_TALLER_YEAR_PROCESO]
GO

/****** Object:  Table [dbo].[SGT_INTEGRANTE_TALLER]    Script Date: 30/04/2026 04:25:23 p. m. ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SGT_INTEGRANTE_TALLER]') AND type in (N'U'))
DROP TABLE [dbo].[SGT_INTEGRANTE_TALLER]
GO

/****** Object:  Table [dbo].[SGT_INTEGRANTE_TALLER]    Script Date: 30/04/2026 04:25:23 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SGT_INTEGRANTE_TALLER](
	[ID_INTEGRANTE_TALLER] [numeric](10, 0) IDENTITY(1,1) NOT NULL,
	[ID_TALLER] [numeric](10, 0) NOT NULL,
	[ID_ESTUDIANTE] [numeric](10, 0) NOT NULL,
	[PRONOM_ESTUDIANTE] [varchar](50) NULL,
	[YEAR_PROCESO] [int] NOT NULL,
	[IND_ESTADO_INTEGRANTE] [int] NOT NULL,
	[FEC_INSCRIPCION] [datetime] NOT NULL,
	[FEC_RETIRO] [datetime] NOT NULL,
	[OBSERVACION] [text] NOT NULL,
	[FEC_REINCORPORACION] [datetime] NOT NULL,
	[AUD_USUARIO_INGRESO] [varchar](20) NOT NULL,
	[AUD_FEC_INGRESO] [datetime] NOT NULL,
	[AUD_USUARIO_MODIFICA] [varchar](20) NOT NULL,
	[AUD_FEC_MODIFICA] [datetime] NOT NULL,
 CONSTRAINT [PK_SGT_ALUMNO_TALLER] PRIMARY KEY CLUSTERED 
(
	[ID_INTEGRANTE_TALLER] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[SGT_INTEGRANTE_TALLER] ADD  CONSTRAINT [DF_SGT_INTEGRANTE_TALLER_YEAR_PROCESO]  DEFAULT ((0)) FOR [YEAR_PROCESO]
GO

ALTER TABLE [dbo].[SGT_INTEGRANTE_TALLER]  WITH CHECK ADD  CONSTRAINT [FK_SGT_ALUMNO_TALLER_SGT_ALUMNO] FOREIGN KEY([ID_ESTUDIANTE])
REFERENCES [dbo].[SGT_ESTUDIANTE] ([ID_ESTUDIANTE])
GO

ALTER TABLE [dbo].[SGT_INTEGRANTE_TALLER] CHECK CONSTRAINT [FK_SGT_ALUMNO_TALLER_SGT_ALUMNO]
GO

ALTER TABLE [dbo].[SGT_INTEGRANTE_TALLER]  WITH CHECK ADD  CONSTRAINT [FK_SGT_INTEGRANTE_TALLER_SGT_TALLER] FOREIGN KEY([ID_TALLER])
REFERENCES [dbo].[SGT_TALLER] ([ID_TALLER])
GO

ALTER TABLE [dbo].[SGT_INTEGRANTE_TALLER] CHECK CONSTRAINT [FK_SGT_INTEGRANTE_TALLER_SGT_TALLER]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID DEL ALUMNO TALLER' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'ID_INTEGRANTE_TALLER'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID DE GESTION TALLER' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'ID_TALLER'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID DEL ALUMNO' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'ID_ESTUDIANTE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Año del proceso del taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'YEAR_PROCESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Estados de un integrante de taller: 1-INSCRITO, 2-RETIRADO, 3-LISTA_ESPERA' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'IND_ESTADO_INTEGRANTE'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Fecha en que se realizó la inscripción de un alumno al taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'FEC_INSCRIPCION'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Fecha en que se hace retiro de un alumno del taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'FEC_RETIRO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Observación o motivo de retiro de un alumno de un taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'OBSERVACION'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'USUARIO QUE INGRESA EL REGISTRO' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_INGRESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FECHA EN QUE SE INGRESA EL REGISTRO' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_FEC_INGRESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'USUARIO QUE MODIFICA UN REGISTRO' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_MODIFICA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FECHA EN QUE SE MODIFICA UN REGISTRO' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_FEC_MODIFICA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'CONTIENE LOS ALUMNOS POR TALLER' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_INTEGRANTE_TALLER'
GO


