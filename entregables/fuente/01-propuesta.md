# Sobra · Propuesta

**Ideathon NEA Tech 2026 · Desafío 03: Del subproducto al mercado**

Equipo 13

16 de octubre de 2026

---

## 1. Resumen

- **Problema:** Corrientes genera cada año decenas de miles de toneladas de cascarilla de arroz y residuos de aserradero, y gran parte se quema o se tira. Usos hay. Lo que pasa es que el que tiene el residuo no sabe quién lo compra, cuánto vale ni si el flete se come la ganancia.
- **Solución:** Sobra es un mapa de oferta y demanda de biomasa del NEA. Para cada par de vendedor y comprador responde una pregunta: **¿cierra el negocio?** Muestra el margen después del flete, un semáforo y cuánto ahorra el comprador.
- **Resultado clave del modelo:** con los supuestos del prototipo (precios estimados y flete de referencia 2026), la cascarilla de arroz suelta es viable solo hasta unos 25 km por ruta; pelletizada, hasta unos **310 km, más de 12 veces más lejos**. La razón es física: suelta pesa 108 kg/m³ y el camión se llena de aire antes que de peso. Los volúmenes, precios y demandas de cada empresa son estimaciones y deben validarse con cada una.
- **A quién sirve:** aserraderos pyme y molinos arroceros (generadores), industrias que hoy queman GLP o leña (compradores) y el Gobierno de Corrientes.

---

## 2. Problema y destinatario

### 2.1 El problema en números

| Dato | Valor | Fuente |
|---|---|---|
| Participación de Corrientes en el arroz nacional, campaña 2025/26 | 48,5 % (1.ª provincia arrocera) | [Bichos de Campo](https://bichosdecampo.com/se-confirma-la-retraccion-del-arroz-tras-perder-un-12-de-area-sembrada-la-produccion-cayo-14-en-la-campana-2025-26/) |
| Arroz cáscara de Corrientes | ≈ 714.000 t | Estimado: 48,5 % de 1.471.673 t nacionales |
| Cascarilla sobre el peso del grano | 20 a 22 % | [USAT](https://repositorio.usat.edu.pe/bitstreams/4ecdc174-33fa-45ee-bfbf-e62161c771ed/download) |
| Cascarilla de origen correntino | ≈ 140.000 a 157.000 t/año | Estimado: 714.000 t × 20 a 22 % |
| Superficie forestada de Corrientes | 516.771 ha (1.ª provincia del país) | [CONICET](https://ri.conicet.gov.ar/handle/11336/162643) |
| Residuos de aserradero en el parque foresto-industrial de Santa Rosa "que actualmente se queman" | ≈ 200.000 t/año (proyección de 2017) | [El Inversor Energético](https://www.elinversorenergetico.com/?p=16526) |
| Densidad aparente de la cascarilla suelta | 108 kg/m³ | [Dyna, UNAL](https://revistas.unal.edu.co/index.php/dyna) |

Una aclaración: la cascarilla queda donde se descascara el arroz, no donde se cosecha. En 2016 Entre Ríos molía el 79 % del arroz del país y Corrientes solo el 2 % ([BCR](https://www.bcr.com.ar/es/print/pdf/node/71619), dato viejo). Parte de la cascarilla del arroz correntino puede terminar fuera de la provincia. Actualizar ese dato es parte del piloto.

### 2.2 Por qué hoy se quema o se tira

Los usos existen y están probados en la región: energía (FRESA en Virasoro cubre más del 20 % del consumo eléctrico de Corrientes con biomasa forestal), pellets (Acon Timber produce 10.000 t/mes en Virasoro), sílice amorfa (UNL-CONICET y Risiera) y sustratos para viveros (INTA Bella Vista). Lo que falta es otra cosa:

1. **Información.** No hay un inventario público y actualizado de cuánto residuo genera cada planta ni de quién podría comprarlo. Los compradores chicos (frigoríficos, secaderos, citrícolas) no se enteran de que la oferta existe.
2. **Flete.** La cascarilla suelta pesa 108 kg/m³: un camión se llena de aire antes que de peso. Más allá de 25 a 50 km, el transporte de residuos agrícolas suele dejar de ser rentable ([BioEnergy Consult](https://www.bioenergyconsult.com/biomass-transportation/)).
3. **Confianza.** Sin ficha técnica (humedad, cenizas, poder calorífico) el comprador no se arriesga, y cada operación se negocia de cero.
4. **Escala.** Un aserradero pyme solo no llena un camión ni firma un contrato de suministro anual.

### 2.3 Destinatarios

| Destinatario | Ejemplos concretos | Qué necesita |
|---|---|---|
| **Generadores** | Aserraderos pyme del parque foresto-industrial de Santa Rosa y de Gobernador Virasoro; molinos arroceros de Mercedes y Paso de los Libres | Saber a quién venderle y si le conviene acondicionar (compactar o pelletizar) |
| **Compradores** | Industrias que usan GLP o leña: frigoríficos, citrícolas, secaderos de granos, yerbateras y secaderos de té, centrales de biomasa | Un combustible local más barato, con volumen y calidad previsibles |
| **Gobierno de Corrientes** | Ministerio de Producción | Datos de oferta, demanda e impacto para orientar políticas y financiamiento |

### 2.4 Evidencia y fuentes consultadas

Partimos de las fuentes sugeridas en la Guía para participantes de la Ideathon NEA Tech 2026 y las ampliamos con fuentes públicas sobre producción, flete, precios y empresas de la región.

Fuentes de la guía que usamos:

- INTA Bella Vista, sustratos: [INTA](https://repositorio.inta.gob.ar/handle/20.500.12123/19224)
- Proyecto Bioeconomía del Norte Argentino: [INTA](https://repositorio.inta.gob.ar/handle/20.500.12123/8662)
- PROBIOMASA / WISDOM: [Argentina.gob.ar](https://www.argentina.gob.ar/node/130645)

Contexto del problema:

- Producción de arroz 2025/26: [Bichos de Campo](https://bichosdecampo.com/se-confirma-la-retraccion-del-arroz-tras-perder-un-12-de-area-sembrada-la-produccion-cayo-14-en-la-campana-2025-26/)
- Molienda de arroz por provincia: [BCR](https://www.bcr.com.ar/es/print/pdf/node/71619)
- Cadena del arroz en Corrientes: [CFI](https://cfi.org.ar/assets/docs/Arroz.pdf)
- Superficie forestada de Corrientes: [CONICET](https://ri.conicet.gov.ar/handle/11336/162643)
- Residuos de aserradero en Santa Rosa: [El Inversor Energético](https://www.elinversorenergetico.com/?p=16526)
- FRESA, biomasa en Virasoro: [Bichos de Campo](https://bichosdecampo.com/nada-se-pierde-todo-se-transforma-en-corrientes-hay-una-fabrica-de-energia-entre-los-bosques-que-convierte-los-residuos-forestales-en-electricidad-para-abastecer-al-20-de-la-provincia/)
- Acon Timber, pellets: [Bichos de Campo](https://bichosdecampo.com/pellet-de-aserrin-y-viruta-en-las-empresas-lacteas-el-enorme-aserradero-acon-timber-produce-10-mil-toneladas-mensuales-y-los-ofrece-como-combustible-alternativo-para-las-calderas/)
- Transporte de biomasa: [BioEnergy Consult](https://www.bioenergyconsult.com/biomass-transportation/)

Parámetros técnicos y precios del modelo:

- Densidad de la cascarilla (108 kg/m³ suelta): [Dyna, UNAL](https://revistas.unal.edu.co/index.php/dyna)
- Poder calorífico de la cascarilla y de sus briquetas y pellets: [Bioenergy Lists bp48](https://stoves.bioenergylists.org/)
- Poderes caloríficos de combustibles: [Forest Research UK](https://www.forestresearch.gov.uk/tools-and-resources/fthr/biomass-energy-resources/reference-biomass/facts-figures/typical-calorific-values-of-fuels/)
- Densidades de biomasa: [FAO](https://www.fao.org/4/j4504e/j4504e08.htm)
- Norma de pellet ISO 17225-2 / DINplus: [DIN CERTCO](https://www.dincertco.de/media/dincertco/dokumente_1/certification_schemes/2-pfg-c-0444_annex-1_en_wood-pellets.pdf)
- Tarifa de flete FETRA, abril 2026: [Bichos de Campo](https://bichosdecampo.com/conflicto-latente-en-buenos-aires-se-intento-negociar-una-nueva-tarifa-referencial-de-fletes-de-granos-pero-no-hubo-acuerdo/)
- Costos del transporte, FADEEAC, julio 2026: [Memo](https://www.memo.com.ar/economia/los-costos-del-transporte-acumulan-una-suba-del-22/)
- Precio del GLP envasado, febrero 2026: [Misiones Online](https://misionesonline.net/2026/02/09/precio-del-gas-aumento-en-misiones-2/)
- Precio de leña y chip, InFoPro Misiones: [Economis](https://economis.com.ar/el-instituto-forestal-de-misiones-dispuso-un-aumento-del-16-en-el-precio-de-la-madera/)
- Precio internacional del pellet: [Global Wood Markets Info](https://www.globalwoodmarketsinfo.com/?p=43069)
- Dólar BNA, octubre 2026: [El Economista](https://eleconomista.com.ar/economia/dolar-hoy-cuanto-cotiza-viernes-9-octubre-n98730)
- Factor de emisión del GLP: IPCC 2006 Guidelines for National Greenhouse Gas Inventories, Vol. 2, Cap. 2 ([IPCC](https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html))

Empresas del mapa (ejemplos): Molinos Ala ([Infocampo](https://www.infocampo.com.ar/?p=229774)), Frigorífico Duhalde ([Infocampo](https://www.infocampo.com.ar/?p=337624)), UTE BV ([Perfil](https://www.perfil.com/noticias/nea/el-plan-limon-da-sus-frutos-corrientes-exporta-citricos-industrializados-por-us-8-millones-al-ano.phtml)), As de Bastos ([Canal 12 Misiones](https://www.canal12misiones.com/?p=502377)). Coordenadas: [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/).

Experiencias internacionales: NISP ([Sitra](https://sitra.fi/en/blogs/industrial-symbioses-what-can-finland-learn-uk)), Excess Materials Exchange ([Sitra](https://arkisto.sitra.fi/en/cases/b2b-matchmaking-platform-to-find-high-value-reuse-options-for-materials-and-products/)), Bolsa de Resíduos de Brasil ([FIEMG](https://www.fiemg.com.br/regional-rio-doce/?p=1253)).

---

## 3. Solución y propuesta de valor

### 3.1 Qué es Sobra

Una aplicación web donde quien genera residuos de madera o arroz y quien puede usarlos se encuentran en un mapa, y cada posible negocio se valúa con números. Funcionalidades del prototipo:

- **Mapa de oferta y demanda.** 13 plantas generadoras reales (aserraderos, molinos arroceros, foresto-industrias) y 10 compradores reales (centrales de biomasa, yerbateras, citrícola, secadero de arroz, frigorífico), con filtros por material y sector.
- **Calculadora "¿cierra el negocio?".** Se elige planta, comprador y estado del material (suelto, compactado o pellet). La app calcula ingreso, flete, costo de acondicionamiento, margen neto y un **semáforo del negocio**: verde si el margen es de al menos 15 %, amarillo entre 0 y 15 %, rojo si es negativo o si al comprador no le conviene.
- **Radio viable.** Un círculo en el mapa muestra hasta dónde conviene mandar el material, y cambia al pasar de suelto a compactado o pellet.
- **Ahorro del comprador** frente al GLP o la leña que usa hoy, comparado por energía útil (poder calorífico × eficiencia de caldera).
- **Publicaciones abiertas.** Cualquiera publica una oferta ("Vendo") o una demanda ("Compro") en un minuto, sin crear cuenta. Entra al cálculo como cualquier otro punto, marcada "sin verificar".
- **Contacto al click.** "Ver contacto" muestra el teléfono o email de quien publicó, con un enlace de WhatsApp con el mensaje armado. Para las empresas del mapa, solo su contacto corporativo público (hoy 6 empresas lo tienen).
- **Avisos de match.** Al publicar, la app muestra los negocios que cierran. Una campanita avisa cuando aparecen nuevos para tus publicaciones.
- **Portada interactiva con ejemplos y cifras globales (`#/inicio`).** Permite recorrer el funcionamiento del modelo antes de entrar al mapa, muestra las cifras consolidadas de plantas, compradores y biomasa disponible, y compara interactivamente el margen y radio de viabilidad de vender suelto, compactado o en pellet.
- **Tema claro (principal) y tema oscuro (alternativo).** Diseño con paleta técnica cobalto, mapas base cartográficos claros y oscuros de Esri, selector instantáneo sin parpadeo y persistencia de preferencia en el navegador.
- **Franja de KPIs en tiempo real.** Métricas flotantes sobre el mapa que cuantifican plantas visibles, volumen mensual total, compradores compatibles y cantidad de negocios que cierran (verde) para el estado elegido.
- **Supuestos editables** (costo del camión, precios, factor de ruta) para probar escenarios propios.
- **Transparencia.** Cada número lleva su etiqueta "real" o "estimado" y el enlace a su fuente, visibles en la pestaña Fuentes.

### 3.2 Hoy vs. con Sobra

| Situación | Hoy | Con Sobra |
|---|---|---|
| Encontrar comprador | Contactos personales o nada; el residuo se quema o se acumula | Mapa con compradores reales filtrados por material |
| Saber si conviene vender | Intuición; el flete aparece después, como sorpresa | Margen neto y semáforo antes de levantar el teléfono |
| Decidir si pelletizar o compactar | Inversión a ciegas | Comparación directa suelto / compactado / pellet, con radio y margen |
| Convencer al comprador | Argumento genérico ("es más barato") | Ahorro mensual concreto frente a su GLP o leña |
| Publicar una oferta o demanda | Avisos dispersos sin datos | Publicación en un minuto que entra al cálculo y genera avisos de match |
| Confiar en los números | Cada parte trae los suyos | Cada dato con fuente y etiqueta real / estimado |
| Información para el Estado | Estudios dispersos y difíciles de acceder (WISDOM 2018) | Base georreferenciada de oferta y demanda |

### 3.3 Qué aprendimos de otras bolsas de residuos

Las experiencias de otros países muestran que publicar residuos no alcanza:

- La **Bolsa de Resíduos de Brasil** reunió más de 6.300 empresas que publicaban residuos, pero solo informaba, no intervenía en la venta y ofrecía poco valor.
- **Excess Materials Exchange** (Países Bajos) pasó de catálogo de materiales a matchmaking con **valuación económica de cada match**, y cobra suscripción por eso.
- El **NISP** del Reino Unido mostró que la facilitación humana pesa: el software tiene que ayudar a quien arma el negocio, no reemplazarlo.

Sobra toma esos aprendizajes. **Valúa cada match**, explica con la física real del flete (densidad, humedad, carga por camión) por qué un negocio cierra o no, y **muestra cuándo no conviene**. Por ejemplo, para una yerbatera que quema leña barata el pellet da "no le conviene al comprador". El pellet le gana al GLP, no a la leña barata, y la app lo dice.

---

## 4. Demo

**Enlace:** [https://ideathon-agro-9u3t-flax.vercel.app/](https://ideathon-agro-9u3t-flax.vercel.app/)

Qué probar en 1 minuto:

1. Abrí la app: arranca con **Molinos Ala (Mercedes)**, unas 1.615 t/mes de cascarilla de arroz (estimado).
2. Con el material **suelto**, mirá el radio viable (unos 25 km por ruta) y elegí un comprador lejano, por ejemplo un frigorífico en Curuzú Cuatiá: el semáforo queda en **rojo**.
3. Cambiá a **pellet**: el radio pasa a unos 310 km, el mismo comprador se pone **verde** y aparece cuánto ahorraría frente a su combustible actual.
4. Elegí **UTE BV (Bella Vista)** y recorré los tres estados: suelto rojo, compactado amarillo, pellet verde.
5. Elegí una **yerbatera a leña** en pellet: "no le conviene al comprador".
6. Publicá un "Vendo" de aserrín con un click en el mapa y tocá "Ver contacto".
7. Abrí la pestaña **Fuentes** y fijate de dónde sale cada número.
8. Podés cambiar entre **tema claro y oscuro** desde el botón de la barra superior o explorar la **portada** con cifras globales y ejemplos interactivos tocando en el logo o navegando a `#/inicio`.

**Alternativa sin conexión:** video de la demo y capturas en el pitch deck.

---

## 5. Tecnologías utilizadas y por qué sirven

| Capa | Tecnología | Por qué sirve para este problema |
|---|---|---|
| Interfaz | React, Vite, Tailwind CSS, shadcn/ui | Aplicación liviana que carga rápido en conexiones rurales; interfaz clara para usuarios no técnicos |
| Mapa | Leaflet con mapas base de Esri y datos de OpenStreetMap | Mapa interactivo sin claves pagas ni costo por uso |
| API | Hono en Cloudflare Workers | Servidor que corre cerca del usuario y cuesta casi cero con poco tráfico; escala sin administrar servidores |
| Base de datos | PostgreSQL con Drizzle ORM | Base estándar que funciona en cualquier proveedor (local, Neon, Supabase, RDS): no ata el proyecto a nadie |
| Dominio compartido | Monorepo con `packages/core` | El mismo cálculo de viabilidad corre en el navegador y en el servidor: un solo lugar para auditar cada fórmula |
| Calidad | Vitest (unitarios), PGlite (base en memoria), Playwright (de punta a punta) | Las fórmulas tienen tests; el recorrido de la demo se prueba automáticamente |
| Arquitectura | Clean architecture con reglas de dependencia verificadas | Se pueden sumar funciones (alertas, pool, logística) o cambiar de base sin reescribir |

Elegimos estas herramientas por cuatro razones: operar cuesta casi nada, anda rápido con conexiones lentas, no dependemos de un proveedor y cualquiera puede revisar el cálculo.

---

## 6. Impacto potencial

### 6.1 Económico

- **Para el generador:** un residuo que hoy es costo o pasivo pasa a ser un ingreso, y sabe de antemano hasta dónde le conviene vender según cómo lo procese.
- **Para el comprador:** puede comparar el costo de su combustible actual (GLP o leña) con el del residuo puesto en su planta, antes de invertir en una caldera.
- **Para la decisión de inversión:** la app muestra qué estado del material (suelto, compactado o pellet) hace viable cada destino. En el ejemplo del prototipo, pelletizar amplía unas 12 veces el radio viable.

Los montos que muestra la app para cada par planta y comprador dependen de volúmenes, precios y demandas estimados; sirven para comparar alternativas, no como valores reales de esas empresas. El piloto (sección 8) los reemplaza por datos validados.

### 6.2 Ambiental (escenario ilustrativo, no promesa)

Base del cálculo (estimación):

- 1 t de pellet de cascarilla: 15 MJ/kg × 80 % de eficiencia de caldera ≈ **12 GJ útiles** ([Bioenergy Lists bp48](https://stoves.bioenergylists.org/); [Forest Research UK](https://www.forestresearch.gov.uk/tools-and-resources/fthr/biomass-energy-resources/reference-biomass/facts-figures/typical-calorific-values-of-fuels/)).
- 1 kg de GLP: 46,3 MJ/kg × 85 % ≈ **39,4 MJ útiles** ([Forest Research UK](https://www.forestresearch.gov.uk/tools-and-resources/fthr/biomass-energy-resources/reference-biomass/facts-figures/typical-calorific-values-of-fuels/)).
- Por lo tanto, **1 t de pellet sustituye ≈ 305 kg de GLP**.
- Factor de emisión del GLP ≈ 3,0 kg CO₂/kg (IPCC 2006 Guidelines, Vol. 2, Cap. 2, combustión estacionaria). El CO₂ de la biomasa se considera biogénico.
- Resultado: **≈ 0,9 t de CO₂ evitadas por tonelada de pellet que reemplaza GLP**.

| Escenario | Cascarilla valorizada | GLP sustituido | CO₂ evitado |
|---|---|---|---|
| 10 % de la cascarilla de origen correntino | ≈ 14.000 a 15.700 t/año | ≈ 4.300 a 4.800 t/año | ≈ 12.600 a 14.100 t/año |

El segundo escenario supone que todo ese pellet reemplaza GLP y que la masa de cascarilla y de pellet es parecida (los dos con 8 a 10 % de humedad). Es un orden de magnitud para dimensionar la oportunidad, no una proyección.

### 6.3 Regional

- **Empleo local** en acondicionamiento (secado, compactado, pelletizado) y transporte.
- **Sustitución de combustibles fósiles** (GLP) por biomasa producida en la provincia.
- **Menos quema a cielo abierto** y menos acumulación de residuos, con menor riesgo de incendio y menos humo.
- **Datos para el Estado:** un inventario georreferenciado de oferta y demanda que hoy no existe en forma pública y actualizada.

---

## 7. Supuestos y limitaciones

### 7.1 Qué es real, qué es estimado y qué es simulado

- **Real:** las empresas del mapa y sus ubicaciones (fuentes públicas y OpenStreetMap), los datos de producción publicados, los parámetros técnicos de la cascarilla y los combustibles, y los precios de referencia del GLP, la leña y el flete, cada uno con su fuente.
- **Estimado:** lo que no tiene dato público, como los precios de pellet y briqueta, las toneladas de cada planta, la demanda de cada comprador y las distancias por ruta. En la app cada uno aparece marcado "estimado", con su cálculo y su fuente.
- **Simulado:** **no hay datos simulados.** Las publicaciones de prueba que se vean en la demo son de ejemplo y aparecen marcadas "sin verificar".

### 7.2 Detalle de supuestos y limitaciones

| Tema | Supuesto o limitación | Cómo se resuelve |
|---|---|---|
| Precios de pellet, briqueta y cascarilla | **Estimados.** Pellet de madera ≈ USD 150/t a granel, tomado del precio europeo (EUR 400 a 430/t) ajustado a Argentina; pellet de cascarilla ≈ USD 110/t (75 % del de madera por su mayor ceniza); briqueta de cascarilla ≈ USD 71/t; cascarilla suelta ≈ USD 10/t (sin mercado formal). Costos de pelletizado y briqueteado: órdenes de magnitud de literatura. Dólar BNA $1.540 | Relevar precios reales en el piloto con AFOA y ACPA |
| Precio del GLP | Garrafa de 45 kg en Misiones, febrero 2026 ($1.556/kg). El GLP industrial a granel puede ser más barato y reducir el ahorro | Pedir facturas reales a los compradores entrevistados |
| Costo del flete | ≈ $2.900/km, estimado desde la tarifa FETRA de abril 2026 y contrastado con FADEEAC ($2.245 a 2.358/km) | Cotizar con fleteros de la zona |
| Demanda de los compradores | **Orden de magnitud** estimado por sector (por ejemplo, 60 t/mes de biomasa para la caldera de un frigorífico mediano); el combustible actual de varios compradores es un supuesto por sector | Entrevistas a compradores |
| Toneladas de los generadores | Estimadas desde la producción pública de cada empresa o, para pymes sin dato, desde un aserradero tipo (550 m³ de rollizo/mes) | Carga directa de cada empresa en el piloto |
| Distancias | Línea recta × 1,3 (factor de ruta editable). No hay ruteo real | Integrar ruteo por camino |
| Publicaciones de usuarios | Abiertas y **sin verificar**, con límite de envíos por conexión | Verificación por CUIT o visita |
| Contactos | Solo contactos corporativos publicados por las propias empresas; hoy 6 empresas lo tienen | Alta voluntaria de empresas |
| Notificaciones | Solo con la app abierta en el navegador (consulta cada ~20 s) | Alertas por email y WhatsApp |
| Cuentas de usuario | No hay cuentas: las publicaciones propias se recuerdan en el navegador | Cuentas cuando haya usuarios recurrentes |
| Modelo de negocio físico | Una sola operación por match, precio puesto en destino (el flete lo paga el vendedor), sin contratos, sin agregación de varios generadores ni logística compartida | Pool de suministro y logística compartida (roadmap) |
| Plataforma | Versión de escritorio; móvil fuera del alcance del prototipo | Versión móvil después del piloto |

---

## 8. Siguiente paso de validación

### 8.1 Plan de 30 a 60 días

| Semana | Acción | Entregable |
|---|---|---|
| 1 y 2 | Relevar **5 aserraderos del parque foresto-industrial de Santa Rosa** y **2 molinos arroceros** (Mercedes, Paso de los Libres): toneladas reales, estacionalidad, destino actual del residuo | Datos reales cargados en el mapa, en lugar de los estimados |
| 1 a 3 | Validar precios de cascarilla, aserrín, chips y pellet con cámaras del sector (**AFOA, ACPA**) y con fleteros | Supuestos de precio pasan de "estimado" a "real" |
| 2 a 4 | **5 entrevistas a compradores que usan GLP** (frigoríficos, citrícolas, secaderos): consumo, precio pagado, disposición a cambiar de caldera | Demanda real y ahorro validado |
| 3 a 6 | **1 ensayo de laboratorio** (INTI o INTA) sobre una muestra de cascarilla o aserrín: humedad, cenizas, poder calorífico | Primera ficha técnica con dato certificado |
| 6 a 8 | Presentar resultados al Ministerio de Producción de Corrientes | Propuesta de tablero provincial |

**Criterio de éxito:**

- Al menos **3 matches en verde** validados con precios reales.
- Al menos **1 carta de intención** firmada entre un generador y un comprador.
- Al menos 5 generadores y 5 compradores con datos propios cargados.

### 8.2 Roadmap corto

1. **Tablero de impacto:** toneladas valorizadas, GLP sustituido, CO₂ evitado.
2. **Ficha técnica del lote con QR:** humedad, cenizas y poder calorífico, con nivel de confianza (declarado, medido o certificado).
3. **Pool de suministro:** sumar varios aserraderos chicos para un contrato grande.
4. **Logística compartida:** cargas agrupadas y fletes de retorno vacíos.
5. **Verificación de publicaciones** por CUIT o visita.
6. **Alertas por email y WhatsApp.**

---

## 9. Modelo de negocio

| Cliente | Qué gana | Cómo paga |
|---|---|---|
| Aserraderos y molinos | Vender lo que hoy queman o tiran | Publicar es gratis; plan pago con alertas, ficha técnica y pool de suministro |
| Industrias que compran calor | Bajar la factura de GLP con combustible local | Suscripción mensual y/o comisión por contrato cerrado |
| Gobierno de Corrientes | Datos de oferta, demanda e impacto | Licencia anual del tablero provincial |
| Laboratorios y fleteros | Clientes derivados desde la app | Comisión por derivación |

- **Freemium:** el mapa y las publicaciones son gratis; la calculadora avanzada, las alertas y el pool se pagan. Referencia: Excess Materials Exchange cobra €99/mes más un cargo por match ([Sitra](https://arkisto.sitra.fi/en/cases/b2b-matchmaking-platform-to-find-high-value-reuse-options-for-materials-and-products/)).
- **Comisión por match cerrado:** un porcentaje de la primera operación o del contrato anual.
- **Licencia B2G:** tablero provincial con datos agregados.

---

## 10. Declaración de uso de IA, componentes previos y datos

### 10.1 Autoría

La identificación del problema, la investigación del desafío, la idea de producto, la definición y priorización de cada funcionalidad, y las decisiones de diseño y de negocio son del equipo.

### 10.2 Uso de inteligencia artificial

- **Programación.** Programamos con asistencia de IA (Claude Code, de Anthropic) bajo nuestra dirección. El equipo definió los requisitos y revisó y validó el resultado.
- **Búsqueda de fuentes y redacción.** También usamos IA como apoyo para buscar fuentes públicas y para redactar y revisar textos. Cada dato lo contrastamos con su fuente y está citado.
- **El producto no usa IA.** Sobra no incluye modelos de IA: el cálculo de viabilidad son fórmulas explícitas, con cada parámetro a la vista.

### 10.3 Componentes previos

**No aplica.** No reutilizamos componentes, código ni desarrollos propios hechos antes de la Ideathon: todo el proyecto se elaboró durante el evento.

### 10.4 Herramientas y librerías de terceros

El prototipo usa herramientas de código abierto y servicios públicos, según sus licencias:


| Componente | Uso en el proyecto |
|---|---|
| React, Vite, Tailwind CSS, shadcn/ui, Radix, lucide | Interfaz web, estilos, componentes e íconos |
| Leaflet y react-leaflet | Mapa interactivo |
| Hono | API web |
| Drizzle ORM | Acceso a la base PostgreSQL |
| PGlite | Base PostgreSQL en memoria para tests |
| Vitest y Playwright | Tests unitarios y de punta a punta |
| Mapas base de Esri | Fondo cartográfico del mapa |
| OpenStreetMap (Nominatim) | Coordenadas de las localidades |
| Fuentes tipográficas Archivo y Geist | Tipografía para display, cuerpo y mono (licencia SIL Open Font License) |

El código propio del proyecto se publica con licencia MIT.

### 10.5 Datos

- **No hay datos simulados.** Las empresas y sus ubicaciones son reales y salen de fuentes públicas y de OpenStreetMap.
- **Valores sin dato público.** Están marcados "estimado", con su cálculo y su fuente visibles en la aplicación.
- **Publicaciones de usuarios.** Se marcan "sin verificar": sus valores los declara quien publica. Las que se vean en la demo son de ejemplo.
- **Contactos.** Solo se muestran contactos corporativos publicados por las propias empresas. Nunca contactos personales.

---

## 11. Equipo

Equipo 13 · Ideathon NEA Tech 2026

Corrientes, 16 de octubre de 2026
