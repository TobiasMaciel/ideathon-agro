# ADR-0007: Notificaciones sin servicios externos

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

Quien publica quiere enterarse cuando aparece un match que cierra. Los avisos por email o WhatsApp requieren un proveedor externo, credenciales y un modelo de cuentas que hoy no existen (ver ADR-0005).

## Decisión

- Al publicar, la interfaz muestra los matches que cierran en ese momento.
- Una campanita avisa de matches nuevos para las publicaciones propias. Esas publicaciones se recuerdan en el navegador con `localStorage`, y la web consulta novedades aproximadamente cada 20 segundos.
- No se usan servicios externos ni se guarda en el servidor qué publicaciones pertenecen a quién.
- Los avisos por email y WhatsApp quedan en el roadmap.

## Consecuencias

- No hay costo ni dependencia de terceros.
- Los avisos llegan solo con la web abierta: no hay notificaciones en segundo plano.
- Si se borra el almacenamiento del navegador o se cambia de dispositivo, se pierde la relación con las publicaciones propias.
- La consulta periódica genera tráfico proporcional a los usuarios con la web abierta.
- La lógica de matches es pura y vive en el dominio; la feature web la usa sin tocar la API más allá del catálogo.
- Los avisos por email o WhatsApp requerirán un ADR nuevo.
