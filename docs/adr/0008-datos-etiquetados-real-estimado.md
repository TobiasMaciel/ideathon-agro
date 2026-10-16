# ADR-0008: Datos etiquetados real/estimado con fuente

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

El producto muestra márgenes, radios y ahorros que dependen de precios, densidades, costos y consumos. Un número sin origen claro no es auditable y puede inducir decisiones equivocadas. Los datos de Corrientes y el NEA provienen de fuentes públicas de calidad dispar.

## Decisión

- Ningún dato es inventado. Cada número lleva una etiqueta:
  - `real`: tomado de una fuente.
  - `estimado`: calculado a partir de valores con fuente, con la fórmula a la vista.
- El modelo de dominio lo expresa como `Tagged { value, tag, sourceIds, note }`, y cada fuente tiene URL y fecha.
- En la base, esos metadatos se guardan en una columna `meta jsonb`.
- Un test de integridad verifica que todo dato tenga fuente y etiqueta, y que las coordenadas estén dentro del NEA.
- La UI no muestra un número sin su etiqueta y acceso a su fuente (componente `TagBadge`).
- Los valores declarados en publicaciones abiertas se etiquetan `estimado`, con la nota de que no están verificados.

## Consecuencias

- Los datos son auditables: cualquiera puede seguir un número hasta su fuente.
- Agregar un dato exige encontrar y registrar una fuente; algunos valores no podrán incorporarse hasta tenerla.
- Cada feature de UI que muestre un número debe incluir su etiqueta, lo que se verifica en la revisión de PR.
- El formato `Tagged` está en el dominio y se serializa tal cual hacia la base y la API.
