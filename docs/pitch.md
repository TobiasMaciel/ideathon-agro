# Sobra — Pitch y estrategia

> 16/10/2026 · Para el equipo, antes de presentar en la Ideathon NEA Tech 2026.
> Demo online: [https://ideathon-agro-9u3t-flax.vercel.app/](https://ideathon-agro-9u3t-flax.vercel.app/)

Sobra convierte residuos de aserraderos y molinos arroceros en ingresos, mostrando en un mapa quién los compra y si el negocio cierra después del flete. Acá están el pitch, la demo, qué sumar antes de presentar, cómo venderlo y cómo ganar.

---

## 1. Pitch de 2 minutos

La idea central: **el problema no es qué hacer con el residuo, es saber si el negocio cierra después del camión.** Todo el pitch vuelve a esa frase.

| Tiempo | Qué se dice | Qué se muestra |
| --- | --- | --- |
| 0:00–0:20 | "Corrientes produce casi la mitad del arroz del país y tiene más de 500.000 hectáreas forestadas. Cada molino y cada aserradero genera montañas de cascarilla y aserrín. Gran parte se quema o se tira. No porque no tenga uso: porque nadie sabe quién lo compra ni si el flete se come la ganancia." | Mapa a pantalla completa con las plantas reales |
| 0:20–0:35 | "Sobra es el lugar donde el que tiene el residuo y el que lo necesita se encuentran, y la app responde una sola pregunta: ¿cierra el negocio?" | Panel con "Tu planta" y la respuesta grande |
| 0:35–1:20 | Demo en vivo (sección 2): la cascarilla suelta no llega a 30 km; pelletizada llega a 310 km y el frigorífico ahorra unos $15 millones por mes frente al GLP. | Cambio de suelto a pellet: el círculo crece, el comprador pasa de rojo a verde |
| 1:20–1:40 | "Y no es un mapa estático: cualquier aserradero o comprador publica su oferta o demanda en un minuto, y el contacto aparece al hacer click." | Publicar una oferta en vivo y tocar "Ver contacto" |
| 1:40–2:00 | "Cada número tiene su fuente. El modelo de negocio: suscripción para generadores y compradores, y un tablero de impacto para la provincia. Lo que pedimos: cinco aserraderos y dos molinos para el piloto." | Pestaña Fuentes y la franja de KPIs |

Cierre para memorizar: **"Que un residuo deje de ser un costo y se vuelva un ingreso, con números que lo demuestren."**

---

## 2. Cómo mostrarlo: la demo en vivo

Regla de oro: **una sola historia, contada con un solo cambio (suelto → pellet).** Nada de recorrer pantallas.

1. **Abrir con la app ya cargada** en Molinos Ala (Adecoagro), Mercedes: unas 1.615 t/mes de cascarilla. Nada de login ni pantallas vacías.
2. **Suelto:** "La cascarilla pesa 108 kg por metro cúbico: el camión se llena de aire." Radio viable de unos 25 km. El Frigorífico Duhalde, en Curuzú Cuatiá a 88 km, queda en **rojo**.
3. **Click en Pellet:** el círculo pasa a unos 310 km, Duhalde pasa a **verde** (margen ≈ 23 %) y el frigorífico **ahorra ≈ $15 M por mes** frente al GLP. Pausa de dos segundos: es el momento del pitch.
4. **Honestidad del modelo:** tocar una yerbatera que quema leña. Queda en rojo con "No le conviene al comprador". Frase: "No vendemos humo: el pellet le gana al GLP, no a la leña barata."
5. **Publicar en vivo:** "Vendo", aserrín en Santa Rosa, un click en el mapa, un teléfono, enviar. Aparece con "SIN VERIFICAR" y "Ver contacto" abre WhatsApp.
6. **Cerrar en la pestaña Fuentes:** FETRA, InFoPro, precio del GLP 2026, OpenStreetMap. "Cada número tiene de dónde sale."

Preparación técnica:

- Dos dispositivos: la notebook con la app y un celular con la misma URL, por si falla algo.
- Grabar un video de 60 segundos de la demo como respaldo si se cae la red.
- Tener una publicación de prueba lista para pegar, para no tipear en vivo.
- Zoom del navegador al 110–125 % si se proyecta.

---

## 3. Mejoras del producto y roadmap

Ordenado por lo que suma frente a lo que cuesta.

| Prioridad | Mejora | Qué aporta | Estado |
| --- | --- | --- | --- |
| 1 | **Tablero de impacto**: toneladas que dejan de quemarse, CO₂ evitado, GLP sustituido, $ que circulan en la región | El número que le habla al jurado y al Gobierno | Roadmap (fórmulas listas) |
| 2 | **Alertas de match**: modal al publicar y campanita en barra con consulta periódica | Convierte el mapa en un marketplace vivo | **Implementado** |
| 3 | **Ficha técnica del lote con QR**: humedad, cenizas, PCI y nivel de confianza (declarado / medido / certificado INTI-INTA) | Ataca la falta de confianza del comprador | Roadmap |
| 4 | **Simulador de caldera**: cuánto cuesta pasar de GLP a biomasa y en cuántos meses se repaga | Crea demanda nueva | Roadmap |
| 5 | **Pool de suministro**: sumar varios aserraderos chicos para un contrato grande | Resuelve la escala de los chicos | Roadmap |
| 6 | **Logística compartida y fletes de retorno** | Ataca el costo número uno: el flete | Roadmap |
| 7 | **Verificación de publicaciones** (CUIT, visita) | Pasa de "sin verificar" a "verificado" | Roadmap |

Si no hay tiempo para programar, mostrar 4–7 como **roadmap en una slide**, no en la demo.

---

## 4. Cómo venderlo

**A quién le vendemos y qué ganan:**

| Cliente | Qué gana | Cómo paga |
| --- | --- | --- |
| Aserraderos y molinos (generadores) | Vender lo que hoy queman o tiran; dejar de pagar por sacarlo | Gratis publicar; plan pago con alertas, ficha técnica y pool |
| Industrias que compran calor (frigoríficos, citrícolas, secaderos, lácteas) | Bajar la factura de GLP con un combustible local | Suscripción mensual y/o comisión por contrato cerrado |
| Gobierno de Corrientes / Ministerio de Producción | Datos de oferta y demanda, impacto ambiental, argumento para financiar plantas | Licencia anual del tablero de impacto |
| Laboratorios y fleteros | Clientes nuevos derivados desde la app | Comisión por derivación |

**Modelo de negocio (para la slide):**

- **Freemium**: publicar y ver el mapa es gratis. La calculadora avanzada, las alertas y el pool se pagan. Referencia: Excess Materials Exchange cobra €99/mes más un fee por match.
- **Comisión por match cerrado**: un % de la primera operación o del contrato anual.
- **Licencia B2G**: tablero provincial con datos agregados.

**Primeros pasos comerciales:**

1. Piloto con 5 aserraderos del parque foresto-industrial de Santa Rosa y 2 molinos arroceros: cargar sus datos reales y conseguir 1 ensayo de laboratorio en INTI.
2. Validar precios reales con un mentor o una cámara (AFOA, ACPA) y reemplazar los valores estimados.
3. Presentar el tablero de impacto al Ministerio de Producción de Corrientes con los números del piloto.
4. Buscar financiamiento verde: los mismos instrumentos que usó Camil en Brasil para su térmica a cascarilla.

---

## 5. Cómo ganar la ideathon

**Lo que mira un jurado y cómo lo cubrimos:**

| Criterio | Cómo lo mostramos |
| --- | --- |
| ¿Entendieron el problema? | Abrir con el dato local (48,5 % del arroz nacional, 516.771 ha forestadas) y la frase "el flete se come la ganancia" |
| ¿La solución responde la consigna? | La pregunta orientadora es "¿es adecuado y viable?": la app responde exactamente eso con un semáforo |
| ¿Funciona de verdad? | Demo en vivo con datos reales, no capturas |
| ¿Es creíble? | Cada número con fuente y etiqueta real / estimado |
| ¿Escala y tiene negocio? | Modelo freemium + B2G + piloto concreto con nombres |
| ¿El equipo puede ejecutarlo? | Ya está construido: front, API, base de datos, tests |

**Diferenciales para repetir:**

- No es una bolsa de avisos: **valúa cada match** (lo que las bolsas de residuos de Brasil no hacían).
- **Física real del flete**: densidad, humedad y carga por camión explican por qué el pellet llega 12 veces más lejos.
- **Honesto**: muestra cuándo no conviene.
- **Local**: empresas, rutas y precios de Corrientes.

**Preguntas difíciles y respuestas:**

| Pregunta del jurado | Respuesta corta |
| --- | --- |
| "¿Los precios son reales?" | "Los del flete y del GLP son de 2026 con fuente; los de pellet y cascarilla son estimados y están marcados. El piloto los reemplaza por precios reales." |
| "¿Quién va a cargar los datos?" | "Las mismas empresas, en un minuto, y nosotros en el piloto. Publicar es gratis." |
| "¿Por qué no usan los compradores que ya existen, como FRESA?" | "Las grandes ya absorben mucho. El valor está en los chicos que hoy no se conocen: tambos, avícolas, secaderos." |
| "¿Cómo ganan plata?" | "Suscripción para usuarios activos, comisión por contrato y licencia para la provincia." |
| "¿Qué pasa si publican cualquier cosa?" | "Todo entra como 'sin verificar' con límite por conexión; la verificación por CUIT es el siguiente paso." |
| "¿Y si el pellet no se puede hacer en el molino?" | "La app muestra el resultado de cada opción: suelto, compactado o pellet. La decisión de invertir queda respaldada por números." |

---

## 6. Fuentes de los números del pitch

- Producción de arroz 2025/26 (Corrientes 48,5 %): [Bichos de Campo](https://bichosdecampo.com/se-confirma-la-retraccion-del-arroz-tras-perder-un-12-de-area-sembrada-la-produccion-cayo-14-en-la-campana-2025-26/)
- Superficie forestada de Corrientes (516.771 ha): [CONICET](https://ri.conicet.gov.ar/handle/11336/162643)
- Tarifa orientativa de flete FETRA, abril 2026: [Bichos de Campo](https://bichosdecampo.com/conflicto-latente-en-buenos-aires-se-intento-negociar-una-nueva-tarifa-referencial-de-fletes-de-granos-pero-no-hubo-acuerdo/)
- Precio del gas envasado, febrero 2026: [Misiones Online](https://misionesonline.net/2026/02/09/precio-del-gas-aumento-en-misiones-2/)
- Excess Materials Exchange (modelo de suscripción): [Sitra](https://arkisto.sitra.fi/en/cases/b2b-matchmaking-platform-to-find-high-value-reuse-options-for-materials-and-products/)
- Radio, margen y ahorro de la demo: cálculo de la app con los datos de `packages/core/src/data` (supuestos por defecto).
- Resto del contexto: [docs/desafio.md](desafio.md).
