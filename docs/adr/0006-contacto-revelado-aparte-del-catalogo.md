# ADR-0006: Contacto revelado aparte del catálogo

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

Las publicaciones incluyen datos de contacto de terceros (WhatsApp, teléfono, email). `GET /api/catalog` es público y se descarga completo: si el contacto viajara ahí, cualquiera podría extraerlo en bloque. Por otro lado, los establecimientos curados son empresas reales y no se deben inventar ni publicar contactos personales.

## Decisión

- El contacto no forma parte del catálogo. Se pide con `GET /api/listings/:id/contact` cuando el usuario toca "Ver contacto", con límite por IP (30 por hora).
- La respuesta incluye un link de WhatsApp con mensaje armado.
- La política de contacto se resuelve con una función pura en el dominio (`resolveContact`), en este orden:
  1. contacto de la publicación;
  2. contacto corporativo público de la empresa, con su fuente;
  3. contacto de la plataforma;
  4. ninguno.
- Los establecimientos curados solo llevan contacto corporativo público (sitio web, teléfono o email general), cada dato con su fuente. Nunca contactos personales ni datos inventados. Si no hay dato público, no tienen contacto.

## Consecuencias

- Se evita la extracción masiva de contactos desde el catálogo.
- Mostrar un contacto cuesta una request adicional.
- La política es testeable sin HTTP ni base, porque vive en el dominio.
- El contrato `ListingContactResponse` es parte de `@mapa/core/contracts`; el dominio no lo conoce.
- El límite por IP en memoria es best-effort (ver ADR-0002).
