# ADR-0005: Publicaciones abiertas sin cuenta

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

El mapa es un punto de encuentro donde cualquiera puede publicar una oferta (Vendo) o una demanda (Compro). Exigir cuenta agregaría fricción y un sistema de identidad que el producto todavía no necesita. A la vez, un endpoint de escritura abierto es una superficie de abuso.

## Decisión

Las publicaciones se aceptan sin login, con estas defensas:

- Cada publicación se muestra marcada "sin verificar"; sus valores entran al cálculo como `estimado`, con la nota "declarado por quien publicó, sin verificar".
- Validación estricta del cuerpo, con límites de texto y de coordenadas al NEA, y un tope de tamaño del body.
- Límite de envíos por IP (5 por hora, 20 por día), usando un hash de la IP con `IP_SALT`, no la IP en claro.
- El rol de base de datos de la API tiene `INSERT` solo en la tabla `listings`.
- Quien publica debe dejar al menos un medio de contacto (WhatsApp, teléfono o email).

## Consecuencias

- Baja fricción para publicar.
- El contenido no está verificado: la interfaz lo comunica y no se mezcla con los datos curados como si fueran equivalentes.
- El límite por IP en memoria es best-effort; en producción debe complementarse con rate limiting de Cloudflare.
- No hay edición ni borrado de publicaciones por parte del usuario; si se agregan, habrá que introducir identidad y un ADR nuevo.
- Las publicaciones propias se recuerdan solo en el navegador (ver ADR-0007).

## Alternativas consideradas

- Registro obligatorio: descartado por la fricción y por el costo de operar identidad.
