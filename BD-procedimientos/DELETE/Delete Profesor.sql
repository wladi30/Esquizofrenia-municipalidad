USE GESTION_TALLER;

IF OBJECT_ID('BORRAR_PROFESOR', 'P') IS NOT NULL
    DROP PROCEDURE BORRAR_PROFESOR; --puede que no lo vuelva a usar, en vez de borrar estudiantes de los talleres, seria mejor colocarlos como inactivos, almacen de datos.
GO

CREATE PROCEDURE BORRAR_PROFESOR --falta actualizar, pero no es prioridad hasta tener primero lo de estudiante terminado
 @ID_PROFESOR INT
AS BEGIN
	DELETE FROM SGT_PROFESOR
	WHERE ID_PROFESOR=@ID_PROFESOR;
	SELECT 'Los datos del profesor/a fueron eliminados' AS RESULTADO;
END;