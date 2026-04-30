USE [GESTION_TALLER]
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'AUD_FEC_MODIFICA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_MODIFICA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'AUD_FEC_INGRESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_INGRESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'IND_ASISTENCIA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'TIPO_PERSONA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'YEAR_PROCESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'ID_PERSONA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'ID_CALENDARIZACION_TALLER'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'ID_ASISTENCIA'
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA] DROP CONSTRAINT [FK_SGT_CONTROL_ASISTENCIA_SGT_CALEDARIZACION_TALLER]
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA] DROP CONSTRAINT [DF_SGT_CONTROL_ASISTENCIA_ARCHIVO_JUSTIFICATIVO]
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA] DROP CONSTRAINT [DF_SGT_CONTROL_ASISTENCIA_IND_ASISTENCIA]
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA] DROP CONSTRAINT [DF_SGT_CONTROL_ASISTENCIA_YEAR_PROCESO]
GO

/****** Object:  Table [dbo].[SGT_CONTROL_ASISTENCIA]    Script Date: 30/04/2026 04:26:19 p. m. ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SGT_CONTROL_ASISTENCIA]') AND type in (N'U'))
DROP TABLE [dbo].[SGT_CONTROL_ASISTENCIA]
GO

/****** Object:  Table [dbo].[SGT_CONTROL_ASISTENCIA]    Script Date: 30/04/2026 04:26:19 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SGT_CONTROL_ASISTENCIA](
	[ID_ASISTENCIA] [numeric](10, 0) IDENTITY(1,1) NOT NULL,
	[ID_CALENDARIZACION_TALLER] [numeric](10, 0) NOT NULL,
	[ID_PERSONA] [numeric](10, 0) NOT NULL,
	[YEAR_PROCESO] [int] NOT NULL,
	[TIPO_PERSONA] [char](1) NOT NULL,
	[IND_ASISTENCIA] [int] NOT NULL,
	[ARCHIVO_JUSTIFICATIVO] [varchar](255) NOT NULL,
	[AUD_USUARIO_INGRESO] [varchar](20) NOT NULL,
	[AUD_FEC_INGRESO] [datetime] NOT NULL,
	[AUD_USUARIO_MODIFICA] [varchar](20) NOT NULL,
	[AUD_FEC_MODIFICA] [datetime] NOT NULL,
 CONSTRAINT [PK_SGT_CONTROL_ASISTENCIA] PRIMARY KEY CLUSTERED 
(
	[ID_ASISTENCIA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA] ADD  CONSTRAINT [DF_SGT_CONTROL_ASISTENCIA_YEAR_PROCESO]  DEFAULT ((0)) FOR [YEAR_PROCESO]
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA] ADD  CONSTRAINT [DF_SGT_CONTROL_ASISTENCIA_IND_ASISTENCIA]  DEFAULT ((1)) FOR [IND_ASISTENCIA]
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA] ADD  CONSTRAINT [DF_SGT_CONTROL_ASISTENCIA_ARCHIVO_JUSTIFICATIVO]  DEFAULT ('SIN ARCHIVO') FOR [ARCHIVO_JUSTIFICATIVO]
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA]  WITH CHECK ADD  CONSTRAINT [FK_SGT_CONTROL_ASISTENCIA_SGT_CALEDARIZACION_TALLER] FOREIGN KEY([ID_CALENDARIZACION_TALLER])
REFERENCES [dbo].[SGT_CALENDARIZACION_TALLER] ([ID_CALENDARIZACION_TALLER])
GO

ALTER TABLE [dbo].[SGT_CONTROL_ASISTENCIA] CHECK CONSTRAINT [FK_SGT_CONTROL_ASISTENCIA_SGT_CALEDARIZACION_TALLER]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID de control de asistencia' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'ID_ASISTENCIA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID de Calendarizacion de talleres' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'ID_CALENDARIZACION_TALLER'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID Persona inasistente al taller (1 Alumno 2 Profesor)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'ID_PERSONA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Año del proceso del taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'YEAR_PROCESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Tipo de persona inasistente (''A'' => Alumno;  ''P'' => Profesor)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'TIPO_PERSONA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'1: ASISTENTE, 2:INASISTENTE' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'IND_ASISTENCIA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Usuario quien ingresó el registro' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_INGRESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Fecha que se ingresó el registro' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'AUD_FEC_INGRESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Usuario quien modificó el registro' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_MODIFICA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Fecha que se modificó el registro' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA', @level2type=N'COLUMN',@level2name=N'AUD_FEC_MODIFICA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Registra la asistencia de profesores y alumno por clase' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CONTROL_ASISTENCIA'
GO


