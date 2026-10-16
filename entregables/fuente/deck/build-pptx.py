# Genera entregables/03-pitch-deck.pptx: deck corto de 7 slides (pitch de 2 minutos), 16:9, editable.
# El texto que se dice va en las notas del orador de cada slide.
#
# Uso:
#   python entregables/fuente/deck/build-pptx.py [--font "Segoe UI"] [--html <archivo.html>]
#     --font  cambia la tipografía sans (por defecto Geist; si no está instalada, PowerPoint la sustituye).
#     --html  además escribe una vista HTML idéntica (mismas cajas, tamaños y textos) para validarla
#             con Playwright: que ningún texto desborde su caja (ver el reporte de validación).
#
# Requiere python-pptx (pip install --user python-pptx). No es dependencia del proyecto.
# Coordenadas en px de un lienzo 1920x1080 (1 px = 6350 EMU; 1 px de fuente = 0,5 pt).
# Antes de guardar valida: cajas dentro del margen de seguridad (0,6 in = 86 px), ninguna caja
# de contenido se toca con otra (separación mínima 8 px) y ningún texto de contenido baja de 20 pt.
import sys
from pathlib import Path

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Pt
from lxml import etree

HERE = Path(__file__).resolve().parent
IMG = HERE / "img"
OUT = HERE.parent.parent / "03-pitch-deck.pptx"
DEMO = "https://ideathon-agro-9u3t-flax.vercel.app/"

SANS = sys.argv[sys.argv.index("--font") + 1] if "--font" in sys.argv else "Geist"
MONO = "Geist Mono"
HTML_OUT = Path(sys.argv[sys.argv.index("--html") + 1]).resolve() if "--html" in sys.argv else None

W, H = 1920, 1080
SAFE = 86  # 0,6 in
GAP = 8
MIN_BODY_PX = 40  # 20 pt
LH = 1.3  # alto de línea "simple" asumido para PowerPoint (conservador), en múltiplos del tamaño

C = {
    "canvas": "f7f8f7", "surface": "ffffff", "line": "dfe4e1", "fg": "141a17", "muted": "55605b",
    "subtle": "5f6a65", "sage": "3a7254", "sage_solid": "447d5f", "coral": "a5523c", "white": "ffffff",
}


# ---------------- modelo de slides ----------------
def R(t, size, color="fg", b=False, mono=False, sp=None, link=None):
    if sp is None:  # tracking negativo en titulares grandes, como el deck (-0,02 a -0,03 em)
        sp = -0.025 * size if (b and not mono and size >= 64) else 0
    return dict(t=t, size=size, color=color, b=b, mono=mono, sp=sp, link=link)


def LBL(t, size=40, color="subtle"):
    return R(t.upper(), size, color, mono=True, sp=0.08 * size)


def T(x, y, w, h, paras, align="left", anchor="top", line=1.0, role="content"):
    if isinstance(paras, dict):
        paras = [[paras]]
    elif paras and isinstance(paras[0], dict):
        paras = [paras]
    return dict(kind="text", x=x, y=y, w=w, h=h, paras=paras, align=align, anchor=anchor, line=line, role=role)


def I(name, x, y, w, h, pos=(0, 0), border=True, role="content", link=None):
    return dict(kind="img", name=name, x=x, y=y, w=w, h=h, pos=pos, border=border, role=role, link=link)


def B(x, y, w, h, fill, alpha=1.0, role="bg"):
    return dict(kind="rect", x=x, y=y, w=w, h=h, fill=fill, alpha=alpha, role=role)


SLIDES = []


def slide(els, notes, chrome=True):
    n = len(SLIDES) + 1
    if chrome:
        els = els + [I("icon.png", 1744, 96, 64, 64, border=False, role="chrome"),
                     T(1608, 950, 200, 40, R(f"{n:02d} / 07", 28, "subtle", mono=True), align="right", role="chrome")]
    SLIDES.append(dict(els=els, notes=notes))


# 1 · Portada
slide([
    I("icon.png", 112, 100, 150, 150, border=False),
    T(112, 262, 880, 400, [[R("Circular", 150, b=True)], [R("NEA", 150, "sage_solid", b=True)]], line=0.95),
    T(112, 676, 880, 100, R("El residuo que vuelve ingreso", 64), line=1.1),
    T(112, 800, 880, 70, R("Equipo 13", 48, b=True)),
    T(112, 890, 880, 60, LBL("Ideathon NEA Tech 2026", 40, "muted")),
    I("03-pellet.jpg", 1040, 180, 768, 814, pos=(0.35, 0.3)),
], chrome=False, notes=(
    "Somos el Equipo 13 y traemos Circular NEA: una plataforma para que los residuos de la agroindustria "
    "y la foresto-industria de Corrientes encuentren comprador, con números que muestran si el negocio cierra."))

# 2 · Problema
slide([
    I("app-light.png", 0, 0, W, H, pos=(0.5, 0.5), border=False, role="bg"),
    B(0, 0, W, H, "canvas", alpha=0.9),
    T(112, 110, 1560, 150, R("Se quema lo que vale", 108, b=True)),
    T(112, 370, 820, 236, [R("48,5", 150, b=True, mono=True), R(" %", 72, b=True, mono=True)]),
    T(112, 620, 780, 140, R("del arroz del país sale de Corrientes", 44, "muted"), line=1.15),
    T(1000, 370, 808, 236, [R("516.771", 150, b=True, mono=True), R(" ha", 72, b=True, mono=True)]),
    T(1000, 620, 808, 140, R("forestadas: primera provincia forestal", 44, "muted"), line=1.15),
    T(112, 846, 1560, 60, LBL("Dato real · Bichos de Campo 2025/26 · CONICET 2019", 40, "sage")),
], notes=(
    "Corrientes produjo el 48,5 % del arroz del país en la campaña 2025/26 y tiene 516.771 hectáreas forestadas. "
    "Eso deja montañas de cascarilla y aserrín que en gran parte se queman o se tiran. "
    "Estimamos unas 150.000 toneladas de cascarilla por año solo del arroz."))

# 3 · Por qué
slide([
    T(112, 110, 1560, 140, R("El flete se come la ganancia", 96, b=True)),
    I("truck.png", 112, 400, 320, 320, border=False),
    T(500, 330, 1300, 376, [R("108", 240, b=True, mono=True), R(" kg/m³", 96, b=True, mono=True)]),
    T(500, 716, 1300, 150, R("Cascarilla suelta: el camión se llena de aire", 48, "muted"), line=1.15),
], notes=(
    "¿Por qué pasa? La cascarilla suelta pesa 108 kilos por metro cúbico: el camión se llena de aire antes que de peso "
    "y el flete se come la ganancia. Además falta información sobre quién compra, y un aserradero chico solo no llena un camión."))

# 4 · Solución
slide([
    T(112, 104, 760, 296, R("¿Cierra el negocio?", 104, b=True)),
    T(112, 436, 80, 60, R("01", 40, "sage", mono=True)),
    T(200, 420, 680, 140, R("Mapa de residuos", 52, b=True), line=1.1),
    T(112, 586, 80, 60, R("02", 40, "sage", mono=True)),
    T(200, 570, 680, 140, R("Margen después del flete", 52, b=True), line=1.1),
    T(112, 736, 80, 60, R("03", 40, "sage", mono=True)),
    T(200, 720, 680, 140, R("Semáforo: cierra o no", 52, b=True), line=1.1),
    I("03-pellet.jpg", 920, 200, 888, 730, pos=(0.62, 0.2)),
], notes=(
    "Circular NEA es un mapa con 13 plantas y 10 compradores reales de la región, más lo que publique cualquiera. "
    "Elegís tu planta, un comprador y cómo vendés: suelto, compactado o pellet. "
    "La app calcula el margen después del flete y lo muestra con un semáforo."))

# 5 · Momento clave
slide([
    T(112, 110, 1500, 140, R("Pelletizar cambia el mapa", 96, b=True)),
    I("02-suelto.jpg", 112, 260, 820, 350, pos=(0.2, 0.35)),
    I("03-pellet.jpg", 988, 260, 820, 350, pos=(0.2, 0.35)),
    T(112, 624, 820, 56, LBL("Suelto", 40, "coral")),
    T(988, 624, 820, 56, LBL("Pellet", 40, "sage")),
    T(112, 700, 1020, 176, [R("25", 132, "coral", b=True, mono=True), R(" → ", 132, b=True, mono=True),
                            R("310 km", 132, "sage", b=True, mono=True)]),
    T(112, 884, 1020, 64, R("~12 veces más radio. Ejemplo con supuestos estimados.", 40, "muted"), line=1.1),
    T(1160, 700, 648, 90, [R("De ", 64, b=True), R("rojo", 64, "coral", b=True), R(" a ", 64, b=True), R("verde", 64, "sage", b=True)]),
    T(1160, 800, 648, 140, [[R("Ahorro frente al GLP,", 44, "muted")], [R("visible al instante", 44, "muted")]], line=1.15),
], notes=(
    "Este es el momento clave. Con la cascarilla suelta, el radio viable es de unos 25 km por ruta. "
    "Pelletizada llega a unos 310 km: unas 12 veces más. El semáforo pasa de rojo a verde y el comprador ve "
    "cuánto ahorra frente a su combustible actual. Es un ejemplo del modelo con supuestos estimados, "
    "no un resultado de esas empresas; los precios reales se validan en el piloto."))

# 6 · Mercado vivo
slide([
    T(112, 110, 1560, 140, R("Publicá. Conectá. Te avisamos.", 96, b=True)),
    I("04-publicar.jpg", 112, 270, 528, 540, pos=(0, 0)),
    I("05-contacto.jpg", 696, 270, 528, 540, pos=(0, 0)),
    I("06-campanita.jpg", 1280, 270, 528, 540, pos=(0.5, 0)),
    T(112, 836, 528, 70, R("En un minuto", 44, b=True)),
    T(696, 836, 528, 70, R("WhatsApp en un click", 44, b=True)),
    T(1280, 836, 528, 70, R("Aviso de match", 44, b=True)),
], notes=(
    "Además es un mercado vivo y sin crear cuenta: publicás en un minuto, ves el contacto y el WhatsApp con un click, "
    "y la app te avisa cuando aparece un negocio compatible. Las publicaciones entran marcadas como sin verificar."))

# 7 · Cierre
slide([
    T(112, 110, 1500, 150, R("Probalo ahora", 108, b=True)),
    I("qr-demo.png", 112, 300, 380, 380, link=DEMO),
    T(560, 330, 1248, 100, R("ideathon-agro-9u3t-flax.vercel.app", 64, "sage", b=True, link=DEMO)),
    T(560, 470, 1248, 90, R("Equipo 13", 64, b=True)),
    B(112, 760, 1696, 2, "line"),
    T(112, 790, 1696, 150, [[R("Programado con asistencia de IA. Idea y diseño: Equipo 13.", 40, "muted")],
                            [R("Componentes previos: no aplica (no reutilizamos desarrollos propios anteriores).", 40, "muted")]]),
], notes=(
    "Pueden probarla ahora en el link o con el QR. Para el piloto buscamos cinco aserraderos y dos molinos con sus datos reales. "
    "La idea y el diseño son del Equipo 13; la programación tuvo asistencia de IA. Gracias."))


# ---------------- validación de cajas ----------------
def validate():
    errs = []
    for n, sd in enumerate(SLIDES, 1):
        boxes = [e for e in sd["els"] if e["role"] != "bg"]
        for e in boxes:
            if e["x"] < SAFE or e["y"] < SAFE or e["x"] + e["w"] > W - SAFE or e["y"] + e["h"] > H - SAFE:
                errs.append(f"slide {n}: fuera del margen de seguridad: {e.get('name') or e['paras'][0][0]['t']}")
            if e["kind"] == "text" and e["role"] == "content":
                for p in e["paras"]:
                    for r in p:
                        if r["size"] < MIN_BODY_PX:
                            errs.append(f"slide {n}: texto menor a 20 pt: {r['t']}")
                        for ch in ("—", "–"):
                            if ch in r["t"]:
                                errs.append(f"slide {n}: raya o guion medio en: {r['t']}")
        for i, a in enumerate(boxes):
            for b in boxes[i + 1:]:
                if (a["x"] < b["x"] + b["w"] + GAP and b["x"] < a["x"] + a["w"] + GAP and
                        a["y"] < b["y"] + b["h"] + GAP and b["y"] < a["y"] + a["h"] + GAP):
                    errs.append(f"slide {n}: se tocan {label(a)} y {label(b)}")
    if errs:
        raise SystemExit("Validación de cajas falló:\n  " + "\n  ".join(errs))


def label(e):
    return e.get("name") or e["paras"][0][0]["t"][:30]


# ---------------- PPTX ----------------
def E(v):
    return Emu(int(round(v * 6350)))


def rgb(name):
    return RGBColor.from_string(C.get(name, name))


ALIGN = {"left": PP_ALIGN.LEFT, "right": PP_ALIGN.RIGHT, "center": PP_ALIGN.CENTER}
ANCHOR = {"top": MSO_ANCHOR.TOP, "middle": MSO_ANCHOR.MIDDLE, "bottom": MSO_ANCHOR.BOTTOM}


def crop_for(e):
    iw, ih = Image.open(IMG / e["name"]).size
    sc = max(e["w"] / iw, e["h"] / ih)
    dw, dh = iw * sc, ih * sc
    ex, ey = (dw - e["w"]) / dw, (dh - e["h"]) / dh
    px, py = e["pos"]
    return px * ex, (1 - px) * ex, py * ey, (1 - py) * ey


def build_pptx():
    prs = Presentation()
    prs.slide_width, prs.slide_height = E(W), E(H)
    for sd in SLIDES:
        s = prs.slides.add_slide(prs.slide_layouts[6])
        s.background.fill.solid()
        s.background.fill.fore_color.rgb = rgb("canvas")
        for e in sd["els"]:
            if e["kind"] == "img":
                p = s.shapes.add_picture(str(IMG / e["name"]), E(e["x"]), E(e["y"]), E(e["w"]), E(e["h"]))
                p.crop_left, p.crop_right, p.crop_top, p.crop_bottom = crop_for(e)
                if e["border"]:
                    p.line.color.rgb = rgb("line")
                    p.line.width = Pt(0.75)
                if e["link"]:
                    p.click_action.hyperlink.address = e["link"]
            elif e["kind"] == "rect":
                shp = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, E(e["x"]), E(e["y"]), E(e["w"]), E(e["h"]))
                shp.fill.solid()
                shp.fill.fore_color.rgb = rgb(e["fill"])
                if e["alpha"] < 1:
                    clr = shp.fill._xPr.find(qn("a:solidFill")).find(qn("a:srgbClr"))
                    etree.SubElement(clr, qn("a:alpha")).set("val", str(int(e["alpha"] * 100000)))
                shp.line.fill.background()
                shp.shadow.inherit = False
            else:
                tb = s.shapes.add_textbox(E(e["x"]), E(e["y"]), E(e["w"]), E(e["h"]))
                tf = tb.text_frame
                tf.word_wrap = True
                tf.auto_size = MSO_AUTO_SIZE.NONE
                tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
                tf.vertical_anchor = ANCHOR[e["anchor"]]
                for i, runs in enumerate(e["paras"]):
                    para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
                    para.alignment = ALIGN[e["align"]]
                    para.line_spacing = e["line"]
                    for r in runs:
                        run = para.add_run()
                        run.text = r["t"]
                        f = run.font
                        f.name = MONO if r["mono"] else SANS
                        f.size = Pt(r["size"] * 0.5)
                        f.bold = r["b"]
                        f.color.rgb = rgb(r["color"])
                        if r["sp"]:
                            run._r.get_or_add_rPr().set("spc", str(int(round(r["sp"] * 0.5 * 100))))
                        if r["link"]:
                            run.hyperlink.address = r["link"]
        s.notes_slide.notes_text_frame.text = sd["notes"]
    prs.save(OUT)
    return len(prs.slides)


# ---------------- HTML gemelo (para validar con Playwright) ----------------
def build_html(path):
    fonts = (HERE / "fonts").as_uri()
    imgs = IMG.as_uri()
    css = f"""
@font-face {{ font-family: "Geist"; src: url("{fonts}/geist-latin-wght-normal.woff2") format("woff2-variations"); font-weight: 100 900; }}
@font-face {{ font-family: "Geist"; src: url("{fonts}/geist-latin-ext-wght-normal.woff2") format("woff2-variations"); font-weight: 100 900; unicode-range: U+0100-02BA, U+1E00-1EFF, U+20A0-20C0; }}
@font-face {{ font-family: "Geist Mono"; src: url("{fonts}/geist-mono-latin-wght-normal.woff2") format("woff2-variations"); font-weight: 100 900; }}
@font-face {{ font-family: "Geist Mono"; src: url("{fonts}/geist-mono-latin-ext-wght-normal.woff2") format("woff2-variations"); font-weight: 100 900; unicode-range: U+0100-02BA, U+1E00-1EFF, U+20A0-20C0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ background: #ccc; }}
.slide {{ position: relative; width: {W}px; height: {H}px; overflow: hidden; background: #{C['canvas']}; margin-bottom: 20px; }}
.el {{ position: absolute; }}
.t {{ display: flex; flex-direction: column; overflow: visible; -webkit-font-smoothing: antialiased; }}
.t p {{ overflow-wrap: normal; }}
img.el {{ object-fit: cover; }}
"""
    out = [f"<!doctype html><html lang='es'><head><meta charset='utf-8'><title>Pitch 2 min</title><style>{css}</style></head><body>"]
    for sd in SLIDES:
        out.append("<section class='slide'>")
        for e in sd["els"]:
            box = f"left:{e['x']}px;top:{e['y']}px;width:{e['w']}px;height:{e['h']}px;"
            if e["kind"] == "img":
                px, py = e["pos"]
                border = f"border:1px solid #{C['line']};" if e["border"] else ""
                out.append(f"<img class='el' data-role='{e['role']}' src='{imgs}/{e['name']}' style='{box}{border}object-position:{px * 100}% {py * 100}%'>")
            elif e["kind"] == "rect":
                c = C[e["fill"]]
                r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
                out.append(f"<div class='el' data-role='bg' style='{box}background:rgba({r},{g},{b},{e['alpha']})'></div>")
            else:
                just = {"top": "flex-start", "middle": "center", "bottom": "flex-end"}[e["anchor"]]
                out.append(f"<div class='el t' data-role='{e['role']}' style='{box}justify-content:{just};text-align:{e['align']}'>")
                for runs in e["paras"]:
                    big = max(r["size"] for r in runs)
                    lh = big * LH * e["line"]
                    out.append(f"<p style='line-height:{lh:.1f}px;font-size:{big}px'>")
                    for r in runs:
                        fam = f'"{MONO}", Consolas, monospace' if r["mono"] else f'"{SANS}", "Segoe UI", Arial, sans-serif'
                        st = (f"font-family:{fam};font-size:{r['size']}px;color:#{C[r['color']]};"
                              f"font-weight:{700 if r['b'] else 400};letter-spacing:{r['sp']}px")
                        out.append(f"<span style='{st}'>{r['t']}</span>")
                    out.append("</p>")
                out.append("</div>")
        out.append("</section>")
    out.append("</body></html>")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(out), encoding="utf-8")


validate()
n = build_pptx()
print(f"PPTX: {OUT} | {n} slides | validación de cajas OK")
if HTML_OUT:
    build_html(HTML_OUT)
    print(f"HTML: {HTML_OUT}")
