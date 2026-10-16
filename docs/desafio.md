# Desafío 03 · Del subproducto al mercado (cascarilla de arroz y biomasa forestal)

> Ideathon NEA Tech 2026 · Corrientes · investigación al 15/10/2026
> Etiquetas de los datos: **[C]** confirmado en la fuente · **[P]** parcial, viejo o de una sola fuente · **[NV]** no verificado, hay que chequearlo antes del pitch

---

## TL;DR

Cuando se procesa arroz o madera queda "basura": **cascarilla** en los molinos arroceros, **aserrín, costaneros y chips** en los aserraderos. Parte ya se usa, pero hay mucho que se quema o se tira porque **el que lo tiene no sabe quién lo necesita**. Tampoco sabe cuánto vale ni si el flete se come la ganancia.

El desafío **no es inventar usos**. Ya hay decenas (energía, pellets, sílice, sustratos, construcción). Lo que hay que resolver es **conectar oferta y demanda de forma viable**: qué material hay, dónde está, con qué calidad, en qué cantidad y todo el año, quién lo compra, y si los números cierran después de pagar el camión.

**En una frase:** que un residuo deje de ser un costo y se vuelva un ingreso, con números que lo demuestren.

---

## Contexto NEA / Corrientes (datos clave)

### Arroz
- **Corrientes es la primera provincia arrocera del país:** produjo el **48,5% del arroz nacional en 2025/26**. Entre Ríos produjo el 30%. [C]
- **Producción nacional 2025/26:** 1.471.673 t en unas 204.900 ha. Cayó un 14% frente a 2024/25 (1.719.230 t). [C]
- **Corrientes ≈ 714.000 t de arroz cáscara.** Es un cálculo propio a partir del 48,5%.
- **Cascarilla ≈ 20–22% del peso del grano.** [C] Eso daría unas **140.000–157.000 t/año de cascarilla** con origen en el arroz correntino. Es una estimación propia.
- **Dato clave: la cascarilla queda donde se descascara el arroz, no donde se cosecha.** En 2016, Entre Ríos molía el 79% del arroz del país y Corrientes solo el 2%. [P, dato viejo] Es posible que buena parte de la cascarilla del arroz correntino termine en Entre Ríos.
- **Actores:** Adecoagro (Molinos Ala, Mercedes) y Copra S.A., entre otros. Diez empresas tienen el 50% del área arrocera correntina. [P]
- **Cómo es el material [P]:**
  - Muy liviana: unos 108–143 kg/m³, lo que encarece mucho el flete.
  - Poder calorífico de unas 3.300–4.000 kcal/kg.
  - Alrededor de 18% de cenizas, y esa ceniza es 90–95% sílice.

### Forestal
- **Corrientes es la primera provincia forestada del país, con 516.771 ha** (inventario 2019). [C]
- **Especies:** alrededor de 65% pino y 35% eucalipto. [P]
- **Biomasa que ya se aprovecha:**
  - **FRESA (Insud), Gob. Virasoro** [C]:
    - Tiene 2 plantas, de unos 40 MW (desde 2020) y 37 MW (San Alonso, inaugurada en 2025). Costaron unos US$200 M.
    - Cubren más del 20% del consumo eléctrico de Corrientes.
    - Usan raleos, despuntes, costaneros y aserrín.
  - **Genergiabio, Santa Rosa** [P]:
    - Es de RenovAr Ronda 1, de unos 12,5 a 18 MW según la fuente.
    - Proyectaba usar unas **200.000 t/año de residuos de aserradero "que actualmente se queman"**, de 40 industrias del parque foresto-industrial.
  - **Acon Timber, Virasoro (2024)** [C]: procesa 200.000 m³/año de madera y tiene una planta de pellets de 10.000 t/mes. Dice que usa el 100% de sus subproductos.
- **Pellets:** hay unas 10 plantas en el país, varias en Misiones y Corrientes (Lipsia, Victoria Maderas, Zeni, EUCA-O, Acon). [C]
  - 1 kg de pellet ≈ 0,81 L de GLP.
  - Compradores posibles: lácteas, avícolas, secaderos de granos, yerba y té, frigoríficos.

### Investigación local que ya existe
- **INTA Bella Vista** probó **sustratos para viveros** con aserrín de eucalipto y cascarilla de arroz, porque hoy los sustratos comerciales son mayormente importados. [C]
- **UNL-CONICET y Risiera SRL (Santa Fe)** tienen una planta piloto de **sílice amorfa** de cascarilla. Esa sílice va a pinturas, caucho, adhesivos, pasta dental y cosmética. [C]
- **PROBIOMASA / WISDOM Corrientes (INTA-FAO, 2018):** es el estudio de oferta y demanda de biomasa de la provincia. Existe, pero es difícil de acceder. [P]

---

## Subproblemáticas

Cada una es un problema más chico, y sobre cualquiera se puede armar un proyecto completo.

1. **Nadie sabe cuánto hay ni dónde.** No existe un inventario público y actualizado de residuos por molino o aserradero, con toneladas por mes.
2. **No se conoce la calidad.** La humedad, la composición, las cenizas y el poder calorífico varían, y los ensayos de laboratorio (INTI/INTA) cuestan plata y tiempo. Sin ficha técnica, el comprador no se arriesga.
3. **El flete mata el negocio.** La cascarilla es muy liviana, unos 125 kg/m³: un camión lleno lleva poco peso. Más allá de 25–50 km, el transporte de residuos agrícolas suele dejar de ser rentable.
4. **El suministro no es continuo.** La cosecha es estacional y el comprador industrial necesita volumen estable todo el año, con contrato.
5. **"Hay un uso técnico" no es lo mismo que "es un buen negocio".** Falta una herramienta simple para calcular la viabilidad.
6. **Los compradores están concentrados o no se conocen.** FRESA y Acon absorben mucho del residuo forestal. Los posibles compradores chicos (tambos, avícolas, secaderos, viveros) no se enteran de que la oferta existe.
7. **Los productores chicos no llegan a escala.** Un aserradero chico solo no llena un camión ni firma un contrato. Juntándose, sí podría.
8. **Faltan estándares y confianza.** Sin una norma de calidad (tipo ISO 17225), cada operación se negocia de cero.
9. **Regulación y pasivo ambiental.** La quema y la acumulación generan humo, riesgo de incendio y multas posibles. [NV: normativa correntina específica]
10. **Plantas caras de financiar.** Las plantas de valorización cuestan mucho y las de energía dependieron de contratos estatales (RenovAr).

---

## Qué existe en otros lados (y qué nos enseña)

| Solución | País | Qué hace | Aprendizaje para nosotros |
|---|---|---|---|
| **NISP** (National Industrial Symbiosis Programme) | Reino Unido | Programa gratuito, financiado por el Estado, con **asesores regionales que juntan empresas** para intercambiar residuos. Declara 47 Mt desviadas de rellenos y más de £1.000 M de ahorro (2005–2013). | **La facilitación humana pesa más que la plataforma.** El software tiene que ayudar a un "broker", no reemplazarlo. |
| **Excess Materials Exchange** | Países Bajos | Arrancó como pasaporte de materiales y pasó a hacer matchmaking con **valuación económica y ambiental** de cada match. Cobra suscripción (€99/mes) y por cada match. | **Un marketplace pasivo no alcanza.** Hay que mostrar cuánto vale cada match. |
| **Materials Marketplace / Rheaply** | EE.UU. | Marketplace de subproductos con unos 2.500 socios. Rheaply lo compró y lo convirtió en software para corporaciones. | El modelo de negocio está en vender la herramienta a la industria, no en los avisos. |
| **Kalundborg Symbiosis** | Dinamarca | Parque industrial con 17 empresas y más de 30 flujos de intercambio (vapor, agua, yeso, biomasa). Evita unas 586.000 t de CO₂ por año. | **La cercanía física es todo.** Los parques foresto-industriales de Corrientes (Santa Rosa, Virasoro) son candidatos naturales. |
| **Bolsa de Resíduos (SIBR)** | Brasil | Bolsa gratuita de las federaciones industriales: más de 6.300 empresas publicaban residuos. Solo informaba, sin intervenir en la venta. | Publicar avisos y nada más **ofrece poco valor**. Hay que acompañar hasta el cierre del negocio. |
| **Biomasud** | España, Portugal, Francia | **Sello de calidad** para biocombustibles no madereros (carozo de oliva, cáscaras), basado en ISO 17225. | **Estandarizar abre mercados**: un "sello NEA" para cascarilla y chips. |
| **Husk Power Systems** | India | Minicentrales de unos 40 kW que gasifican cascarilla **al lado del molino** y venden electricidad a la comunidad. | **Procesar en el origen evita el flete.** Hay que llevar la tecnología al residuo, no el residuo a la tecnología. |
| **Camil / Josapar** | Brasil (RS) | Molinos arroceros que generan su **propia energía con cascarilla**. Camil lo financió con un bono verde de R$150 M. | La cascarilla puede ser la caldera del propio molino, y hay financiamiento verde para eso. |
| **Biovalor** | Uruguay | Programa estatal con ONUDI para convertir residuos agroindustriales en energía y subproductos. | Modelo de alianza público-privada aplicable a Corrientes. |

---

## Ideas de solución

Las ideas están ordenadas por subproblemática. **Ninguna necesita IA dentro del producto**: la IA la usamos solo para construir el MVP más rápido. Cada idea dice para quién es, qué hace, qué MVP se puede mostrar en la demo y por qué se diferencia.

### A. Mapa e inventario (subproblemas 1 y 6)

**A1. "Mapa Circular NEA": el inventario georreferenciado de subproductos**
- **Usuario:** molinos, aserraderos, compradores y el Gobierno de Corrientes.
- **Qué hace:** un mapa con cada generador (molino o aserradero), el tipo de residuo, las t/mes, la estacionalidad y la calidad declarada. Se cruza con capas de compradores posibles: tambos, avícolas, secaderos, viveros, cementeras, centrales de biomasa.
- **MVP:** mapa con Leaflet y datos simulados realistas (ubicaciones reales de parques industriales y localidades arroceras), filtros por material y radio.
- **Diferencial:** hoy ese dato no existe en forma pública y actualizada. Es la "capa base" sobre la que se apoyan las demás ideas.

**A2. Alta de residuos en 2 minutos, por WhatsApp o formulario simple**
- **Usuario:** un aserradero chico, sin sistema ni oficina técnica.
- **Qué hace:** carga "tengo X t/mes de aserrín húmedo en Santa Rosa", con foto y ubicación, y queda publicado en el mapa.
- **MVP:** formulario web mobile-first o un bot simulado.
- **Diferencial:** baja la barrera de entrada para los más chicos, que son los que más queman.

**A3. Mapa de demanda: "¿quién podría comprar?"**
- **Qué hace:** lista y ubica sectores que consumen calor o materiales y podrían reemplazar GLP, leña o sustrato importado. Por ejemplo, un secadero de yerba que usa leña o un tambo que usa GLP.
- **MVP:** capa de demanda con datos públicos o simulados y el consumo energético estimado de cada sector.
- **Diferencial:** no espera a que el comprador aparezca: **lo busca activamente**.

### B. Viabilidad económica y flete (subproblemas 3 y 5) ⭐ el corazón del desafío

**B1. "¿Cierra el negocio?": calculadora de viabilidad por match**
- **Usuario:** el dueño del residuo y el comprador.
- **Qué hace:** se elige un material, un origen y un destino, y calcula:
  - Ingreso por venta.
  - Costo del flete por distancia real y densidad (cuántas toneladas entran en un camión).
  - Costo de acondicionar el material (secado, compactado, pelletizado).
  - Resultado: **margen neto y semáforo**.
  - Comparación contra la alternativa actual del comprador, por ejemplo "este tambo ahorra $X por mes frente al GLP".
- **MVP:** calculadora interactiva sobre el mapa, con supuestos editables y bien etiquetados (real, estimado o simulado).
- **Diferencial:** responde exactamente la pregunta de la guía: *"¿es económicamente viable?"*. Muestra lo que las bolsas de residuos de Brasil no mostraban.

**B2. Radio de viabilidad**
- **Qué hace:** para cada generador dibuja en el mapa **hasta dónde conviene mandar el material**, según su densidad y si está suelto, compactado o pelletizado.
- **MVP:** círculos o isócronas en el mapa que cambian al elegir "suelto", "compactado" o "pellet".
- **Diferencial:** un gráfico que se entiende en 2 segundos en el pitch: "**pelletizada, la cascarilla llega 5 veces más lejos**".

**B3. Logística compartida: "carpooling" de camiones de biomasa**
- **Usuario:** varios aserraderos chicos o molinos de la misma zona.
- **Qué hace:** junta cargas para llenar camiones y arma rutas con varias paradas. También aprovecha **fletes de retorno vacíos**, como camiones que llevan arroz a Entre Ríos y vuelven vacíos.
- **MVP:** se marcan generadores y la herramienta propone una ruta agrupada con el costo por tonelada.
- **Diferencial:** ataca el problema número uno (el flete) con un recurso que ya existe y hoy se desperdicia.

### C. Calidad y confianza (subproblemas 2 y 8)

**C1. "Ficha técnica del lote" + sello de calidad NEA**
- **Qué hace:** una ficha estándar por lote, basada en ISO 17225 y Biomasud:
  - Humedad, cenizas, poder calorífico y granulometría.
  - Si el dato es **declarado, medido en campo o certificado por un laboratorio (INTI/INTA)**.
  - Un QR que el comprador escanea.
- **MVP:** generador de fichas con niveles de confianza y QR.
- **Diferencial:** el comprador sabe qué recibe. Es lo que hizo Biomasud en Europa, aplicado al NEA.

**C2. Kit de autoevaluación barata**
- **Qué hace:** un protocolo simple para medir humedad (con un medidor de unos US$30 o pesando antes y después de secar en horno) y cargar el resultado. Recomienda cuándo vale la pena un ensayo de laboratorio formal.
- **MVP:** paso a paso guiado en la app.
- **Diferencial:** hace accesible la caracterización técnica para los chicos.

**C3. Muestreo colectivo con laboratorios**
- **Qué hace:** junta las muestras de varios generadores para negociar en conjunto ensayos con INTI/INTA y abaratar el costo por empresa.
- **MVP:** pantalla de "pedido grupal de ensayo" con costo compartido.

### D. Continuidad y contratos (subproblemas 4 y 7)

**D1. "Pool de suministro": agregador de oferta**
- **Qué hace:** suma la oferta de varios generadores chicos para garantizar un volumen mensual estable a un comprador grande. Muestra un **calendario de disponibilidad** mes a mes según la estacionalidad.
- **MVP:** gráfico de oferta mensual agregada contra demanda, con la brecha marcada.
- **Diferencial:** convierte muchos residuos chicos en un proveedor confiable.

**D2. Plantillas de contrato de suministro**
- **Qué hace:** contrato modelo con cláusulas de volumen mínimo, calidad (según la ficha C1), penalidades y precio indexado (por ejemplo, al GLP).
- **MVP:** generador de contrato a partir del match.

**D3. Acopio intermedio / "hub" de biomasa**
- **Qué hace:** propone dónde ubicar un centro de acopio y acondicionamiento (secado y compactado) que sirva a varios generadores. Es el modelo Kalundborg aplicado a los parques foresto-industriales de Santa Rosa o Virasoro.
- **MVP:** el mapa sugiere la ubicación óptima del hub según el volumen y la distancia.

### E. Nuevos usos y mercados (subproblema 5)

**E1. Catálogo de usos con "semáforo de viabilidad"**
- **Qué hace:** para cada material, lista los usos posibles: energía, pellets, sílice, sustratos, cama avícola, construcción, biochar. De cada uno muestra la escala mínima, la inversión aproximada, el precio de referencia, los requisitos técnicos y el **caso real que ya lo hace** (Risiera, FRESA, Acon, Camil, INTA Bella Vista).
- **MVP:** fichas navegables con filtros.
- **Diferencial:** educa y aterriza; "aplicación técnica" no es lo mismo que "negocio".

**E2. Sustituto de sustrato importado para viveros**
- **Usuario:** viveros forestales y citrícolas de Corrientes, con base en el ensayo de INTA Bella Vista.
- **Qué hace:** conecta a los molinos y aserraderos con los viveros y calcula el ahorro frente al sustrato importado.
- **Diferencial:** usa investigación local que ya está hecha y sustituye importaciones.

**E3. Calor para la agroindustria: del GLP o la leña al pellet o la cascarilla**
- **Usuario:** secaderos de yerba y té, tambos, avícolas.
- **Qué hace:** un simulador de "cuánto ahorro si cambio mi caldera", que muestra el ahorro, el repago y el combustible local disponible cerca.
- **Diferencial:** crea demanda nueva, no solo busca la que ya existe.

**E4. Energía en el molino (modelo Camil / Husk Power)**
- **Qué hace:** evalúa si a un molino le conviene una caldera o gasificador a cascarilla para su propio consumo: ahorro, inversión y financiamiento verde posible.
- **Diferencial:** el residuo no viaja, que es la solución más directa al problema del flete.

### F. Gobierno, impacto e incentivos (subproblemas 9 y 10)

**F1. Tablero de impacto provincial**
- **Usuario:** el Gobierno de Corrientes o un ministerio de Producción.
- **Qué hace:** muestra las toneladas valorizadas, las t de CO₂ evitadas, el GLP sustituido y los empleos generados.
- **MVP:** dashboard con datos simulados.
- **Diferencial:** le da al Estado un argumento para apoyar y escalar, como hace el gobierno británico con el NISP.

**F2. Certificados de residuo valorizado**
- **Qué hace:** cada operación genera un comprobante trazable de que el residuo fue valorizado y no quemado, útil para reportes ESG y certificaciones como FSC.
- **Diferencial:** los compradores con metas de sustentabilidad tienen un motivo extra para comprar.

---

## Recomendación para este desafío

**Combinar A1 + B1 + B2 en un solo producto: "Mapa Circular NEA, ¿cierra el negocio?".**

**Demo de 2 minutos:**
1. Un aserradero de Santa Rosa carga "80 t/mes de aserrín, 45% de humedad".
2. El mapa le muestra 6 compradores posibles.
3. La calculadora indica que suelto solo le conviene el comprador a 30 km.
4. Pelletizado, el radio se amplía y aparece un secadero de yerba que **ahorra $X por mes frente al GLP**.
5. Semáforo verde. Se genera la ficha técnica (C1).

**Por qué gana:**
- Responde literalmente la pregunta orientadora (adecuado + viable).
- Integra las tres pistas de la guía: características técnicas, compradores y flete.
- Toma lo que aprendieron NISP y Excess Materials Exchange: no es un marketplace pasivo, **valúa cada match**.

**Siguiente paso de validación (para el pitch):** relevar 5 aserraderos de Santa Rosa y 2 molinos arroceros, y pedir 1 ensayo de laboratorio al INTI.

---

## A verificar antes del pitch

- Lista actualizada de molinos arroceros en Corrientes y dónde se descascara realmente el arroz correntino hoy.
- Toneladas por departamento del estudio WISDOM Corrientes (2018).
- Precios locales actuales de cascarilla, chips, aserrín y pellet (pedirlos a un mentor o a un aserradero).
- Normativa correntina sobre quema o disposición de residuos.

---

## Fuentes

- Producción de arroz 2025/26 (Bichos de Campo): https://bichosdecampo.com/se-confirma-la-retraccion-del-arroz-tras-perder-un-12-de-area-sembrada-la-produccion-cayo-14-en-la-campana-2025-26/
- Informe arroz 2024/25 (BCSF, ACPA, INTA y BCER): https://es.scribd.com/document/934586490/Documento
- Molienda por provincia (BCR): https://www.bcr.com.ar/es/print/pdf/node/71619
- Molinos Ala / Adecoagro: https://www.infocampo.com.ar/?p=229774
- Superficie forestada de Corrientes (CONICET): https://ri.conicet.gov.ar/handle/11336/162643
- Forestación en Argentina (Agrofy): https://news.agrofy.com.ar/noticia/213877/forestacion-argentina-supero-13-millones-hectareas
- FRESA, biomasa en Virasoro: https://bichosdecampo.com/nada-se-pierde-todo-se-transforma-en-corrientes-hay-una-fabrica-de-energia-entre-los-bosques-que-convierte-los-residuos-forestales-en-electricidad-para-abastecer-al-20-de-la-provincia/
- Segunda planta de Insud: https://econojournal.com.ar/destacada/insud-inauguro-su-segunda-planta-de-energia-renovable-a-partir-de-biomasa-forestal/
- Genergiabio, Santa Rosa: https://www.infocampo.com.ar/?p=359647
- Acon Timber, pellets: https://bichosdecampo.com/pellet-de-aserrin-y-viruta-en-las-empresas-lacteas-el-enorme-aserradero-acon-timber-produce-10-mil-toneladas-mensuales-y-los-ofrece-como-combustible-alternativo-para-las-calderas/
- Plantas de pellets en Argentina: https://www.infocampo.com.ar/?p=617740
- INTA Bella Vista, sustratos: https://repositorio.inta.gob.ar/handle/20.500.12123/19224
- INTA Bioeconomía Norte: https://repositorio.inta.gob.ar/handle/20.500.12123/8662
- PROBIOMASA / WISDOM: https://www.argentina.gob.ar/node/130645
- Visor SIG de la Secretaría de Energía: https://sig.energia.gob.ar/visor/visorsig.php?t=19
- Sílice de cascarilla, UNL y Risiera: https://listas.unl.edu.ar/mailman3/hyperkitty/list/mediosciencia@listas.unl.edu.ar/2024/2/
- Propiedades de la cascarilla: https://www.redalyc.org/pdf/849/84903743.pdf
- Residuos agrícolas en la construcción (FAPESP): https://revistapesquisa.fapesp.br/es/los-residuos-del-campo-que-sirven-en-la-construcci%c3%b3n/
- Transporte de biomasa: https://www.bioenergyconsult.com/biomass-transportation/
- Camil, térmica a cascarilla: https://braziljournal.com/camil-vai-investir-em-termica-movida-a-casca-de-arroz/
- NISP (Sitra): https://sitra.fi/en/blogs/industrial-symbioses-what-can-finland-learn-uk
- Excess Materials Exchange: https://arkisto.sitra.fi/en/cases/b2b-matchmaking-platform-to-find-high-value-reuse-options-for-materials-and-products/
- Rheaply y Materials Marketplace: https://www.wastedive.com/news/rheaply-acquires-materials-marketplace-reuse-platform/633650/
- Kalundborg: https://stateofgreen.com/en/solutions/kalundborg-industrial-symbiosis-surplus-from-circular-production/
- Bolsa de Resíduos (Brasil): https://www.fiemg.com.br/regional-rio-doce/?p=1253
- Biomasud: https://cordis.europa.eu/project/id/691763
- Husk Power Systems: https://en.wikipedia.org/wiki/Husk_Power_Systems
- Biovalor (Uruguay): https://www.gub.uy/ministerio-industria-energia-mineria/politicas-y-gestion/proyecto-biovalor
