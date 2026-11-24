# Manual de usuario

## Alcance

La aplicación permite consultar juegos y torneos, crear una cuenta de jugador, inscribirse y, según el rol, administrar torneos, equipos y usuarios. El perfil muestra información de la cuenta autenticada y sus inscripciones. La edición de perfil, partidos, resultados y estadísticas todavía no forma parte de las funciones conectadas.

## Preparación

1. Inicia primero el backend y luego el frontend siguiendo [el README](../README.md).
2. Abre `http://localhost:5173`.
3. Si los torneos no cargan, comprueba que la API esté activa en `http://localhost:8080` y que `VITE_API_URL` apunte a `/api/v1`.

## Crear cuenta e iniciar sesión

1. Selecciona **Crear cuenta**.
2. Ingresa tu nombre, correo y contraseña según las indicaciones del formulario.
3. La cuenta pública se crea con rol **Jugador**.
4. Inicia sesión con el mismo correo y contraseña. El nombre y rol aparecerán en la cabecera.
5. Al cerrar sesión se eliminan los tokens de la pestaña.

Los roles de organizador y administrador se asignan desde la administración de usuarios por una cuenta administradora.

## Consultar juegos y torneos

1. Abre **Torneos** para consultar los datos que entrega el servidor.
2. Usa los filtros disponibles para acotar el listado.
3. Abre el detalle para revisar juego, fechas, cupos, reglas y estado.
4. Los datos del catálogo dependen de la API; si no hay torneos cargados, la pantalla se mostrará sin datos inventados.

## Inscribirse a un torneo

1. Inicia sesión con una cuenta Jugador.
2. Abre **Inscripción** o selecciona la opción desde un torneo.
3. Elige un torneo abierto y confirma las reglas.
4. Para un juego `1v1`, se inscribe la cuenta individualmente. Para juegos por equipo, selecciona un equipo activo compatible en el que seas integrante.
5. Envía la inscripción y revisa el resultado. El servidor comprueba plazo, cupos, duplicados y elegibilidad.

Las inscripciones se asocian a la cuenta autenticada; el navegador no permite enviar una inscripción a nombre de otra persona.

## Gestionar equipos

Organizadores y administradores pueden crear equipos, elegir el juego, asignar un capitán y agregar jugadores registrados. El capitán debe estar dentro del equipo. Se pueden actualizar los integrantes y activar/desactivar el equipo. El servidor impide borrar equipos con inscripciones vinculadas.

## Gestionar torneos

Organizadores y administradores pueden crear y actualizar torneos con un juego del catálogo, modalidad, cupo y fechas válidas. Si un torneo ya tiene inscripciones, no se puede eliminar: actualiza su estado para conservar el registro de participación.

## Administrar usuarios

Solo el Administrador puede consultar usuarios y asignar los roles **Jugador**, **Organizador** o **Administrador**. Cuando cambia un rol, esa persona debe iniciar sesión otra vez para obtener un token con los permisos nuevos.

## Solución de problemas

- **No aparecen juegos o torneos:** verifica que el backend esté encendido y que `VITE_API_URL` tenga la dirección correcta.
- **401 / sesión vencida:** vuelve a iniciar sesión; si el refresh token sigue vigente, la aplicación intenta renovar la sesión automáticamente.
- **403 / permiso insuficiente:** la cuenta no tiene el rol requerido para esa operación.
- **No se puede inscribir:** confirma el estado y plazo del torneo, que existan cupos y que el equipo corresponda al juego y tenga los integrantes requeridos.
- **Documentación técnica:** Swagger está en `http://localhost:8080/swagger-ui.html`.
