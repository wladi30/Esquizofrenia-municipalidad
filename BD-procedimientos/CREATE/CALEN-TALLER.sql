USE [GESTION_TALLER]
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_FEC_MODIFICA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_MODIFICA'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_FEC_INGRESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_INGRESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'FRECUENCIA_CALENDARIZACION'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'IND_ESTADO_CALENDARIZACION'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'ESTADO_CALENDARIZACION_TALLER'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'HORA_TERMINO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'HORA_INICIO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'FEC_TALLER'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'ID_TALLER'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'YEAR_PROCESO'
GO

EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'ID_CALENDARIZACION_TALLER'
GO

ALTER TABLE [dbo].[SGT_CALENDARIZACION_TALLER] DROP CONSTRAINT [DF_SGT_CALENDARIZACION_TALLER_TIPO_CALENDARIZACION]
GO

ALTER TABLE [dbo].[SGT_CALENDARIZACION_TALLER] DROP CONSTRAINT [DF_SGT_CALENDARIZACION_TALLER_IND_ESTADO_CALENDARIZACION]
GO

ALTER TABLE [dbo].[SGT_CALENDARIZACION_TALLER] DROP CONSTRAINT [DF_SGT_CALENDARIZACION_TALLER_YEAR_PROCESO]
GO

/****** Object:  Table [dbo].[SGT_CALENDARIZACION_TALLER]    Script Date: 30/04/2026 04:26:10 p. m. ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SGT_CALENDARIZACION_TALLER]') AND type in (N'U'))
DROP TABLE [dbo].[SGT_CALENDARIZACION_TALLER]
GO

/****** Object:  Table [dbo].[SGT_CALENDARIZACION_TALLER]    Script Date: 30/04/2026 04:26:10 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SGT_CALENDARIZACION_TALLER](
	[ID_CALENDARIZACION_TALLER] [numeric](10, 0) IDENTITY(1,1) NOT NULL,
	[YEAR_PROCESO] [int] NOT NULL,
	[ID_TALLER] [numeric](10, 0) NOT NULL,
	[FEC_TALLER] [date] NOT NULL,
	[HORA_INICIO] [time](7) NOT NULL,
	[HORA_TERMINO] [time](7) NOT NULL,
	[ESTADO_CALENDARIZACION_TALLER] [int] NOT NULL,
	[IND_ESTADO_CALENDARIZACION] [int] NOT NULL,
	[FRECUENCIA_CALENDARIZACION] [int] NOT NULL,
	[ARCHIVO_CONTROL_ASISTENCIA] [varchar](255) NOT NULL,
	[AUD_USUARIO_INGRESO] [varchar](20) NOT NULL,
	[AUD_FEC_INGRESO] [datetime] NOT NULL,
	[AUD_USUARIO_MODIFICA] [varchar](20) NOT NULL,
	[AUD_FEC_MODIFICA] [datetime] NOT NULL,
 CONSTRAINT [PK_SGT] PRIMARY KEY CLUSTERED 
(
	[ID_CALENDARIZACION_TALLER] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[SGT_CALENDARIZACION_TALLER] ADD  CONSTRAINT [DF_SGT_CALENDARIZACION_TALLER_YEAR_PROCESO]  DEFAULT ((0)) FOR [YEAR_PROCESO]
GO

ALTER TABLE [dbo].[SGT_CALENDARIZACION_TALLER] ADD  CONSTRAINT [DF_SGT_CALENDARIZACION_TALLER_IND_ESTADO_CALENDARIZACION]  DEFAULT ((1)) FOR [IND_ESTADO_CALENDARIZACION]
GO

ALTER TABLE [dbo].[SGT_CALENDARIZACION_TALLER] ADD  CONSTRAINT [DF_SGT_CALENDARIZACION_TALLER_TIPO_CALENDARIZACION]  DEFAULT ((0)) FOR [FRECUENCIA_CALENDARIZACION]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID de la calendarización del taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'ID_CALENDARIZACION_TALLER'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Año del proceso del taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'YEAR_PROCESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID de gestion del taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'ID_TALLER'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Corresponde ala fecha que realizó el taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'FEC_TALLER'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Hora de inicio del taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'HORA_INICIO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Hora de termino del taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'HORA_TERMINO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Estado de la calendarización del taller( 1 => Calendarizado; 2 => En ejecución; 3 => Ejecutado; 4 => Suspendido)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'ESTADO_CALENDARIZACION_TALLER'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'1 = vigente, 2 = no vigente' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'IND_ESTADO_CALENDARIZACION'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Indica la Frecuencia de la Calendarización a realizar. Valores posibles: 1 => Semanal; 2 => Mensual;' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'FRECUENCIA_CALENDARIZACION'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Usuario quien ingresó el registro' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_INGRESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Fecha que se ingresó el registro' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_FEC_INGRESO'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Usuario quien modificó el registro' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_USUARIO_MODIFICA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Fecha que se modificó el registro' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER', @level2type=N'COLUMN',@level2name=N'AUD_FEC_MODIFICA'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Registra la calendarización de los talleres, fecha y hora donde se dará el taller' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'SGT_CALENDARIZACION_TALLER'
GO


