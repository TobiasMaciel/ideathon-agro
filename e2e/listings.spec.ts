import { expect, test, type Page } from "@playwright/test";

// Publicaciones abiertas (F1). La API guarda en memoria mientras vive: cada test usa nombres únicos y no cuenta totales.
// Playwright levanta la API con ENVIRONMENT=development y RATE_LIMIT_DISABLED=1 (ver playwright.config.ts).

async function open(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("generator-select")).toBeVisible();
  await expect(page.locator('[data-testid="map"] [data-marker^="gen-"]').first()).toBeVisible();
}

async function openForm(page: Page) {
  await page.getByTestId("publish-open").click();
  const dialog = page.getByTestId("publish-dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Marca la ubicación tocando el mapa (zona libre a la izquierda del panel, dentro del NEA). */
async function pickOnMap(page: Page) {
  const dialog = page.getByTestId("publish-dialog");
  await dialog.getByTestId("pick-on-map").click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("pick-banner")).toContainText("Tocá el mapa para ubicar tu establecimiento");
  await page.getByTestId("map").click({ position: { x: 380, y: 420 } });
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("draft-pin")).toBeAttached();
  await expect(dialog.getByTestId("listing-location-value")).toContainText(/° S · \d+,\d{4}° O/);
}

async function chooseMaterial(page: Page, id: string) {
  await page.getByTestId("listing-material").click();
  await page.getByTestId(`listing-material-${id}`).click();
}

test("publicar una oferta de aserrín marcando en el mapa y ver el contacto", async ({ page }) => {
  const name = `Aserradero E2E ${Date.now()}`;
  await open(page);
  const dialog = await openForm(page);

  await expect(dialog.getByTestId("kind-oferta")).toHaveAttribute("data-state", "on");
  await dialog.getByLabel("Nombre del establecimiento").fill(name);
  await dialog.getByLabel("Localidad").fill("Santa Rosa");
  await chooseMaterial(page, "aserrin");
  await dialog.getByLabel("Toneladas por mes").fill("120");
  await dialog.getByLabel("WhatsApp o teléfono").fill("3794 412345");
  await pickOnMap(page);
  await expect(dialog.getByTestId("listing-location-value")).toContainText("Santa Rosa");

  await dialog.getByTestId("publish-submit").click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("notice")).toContainText("Publicación creada");

  const select = page.getByTestId("generator-select");
  await expect(select).toHaveAttribute("data-value", /^pub-/);
  await expect(select).toContainText(name);
  const id = await select.getAttribute("data-value");
  await expect(page.locator(`[data-testid="map"] [data-marker="gen-${id}"]`)).toHaveAttribute("data-origin", "publicacion");

  const info = page.getByTestId(`listing-info-${id}`);
  await expect(info.getByTestId("unverified-badge")).toHaveText(/sin verificar/i);
  await expect(info).toContainText(/Publicado (recién|hace)/);
  await info.getByTestId("contact-reveal").click();
  await expect(info.getByTestId("listing-contact")).toContainText("3794 412345");
  const wa = info.getByTestId("contact-whatsapp");
  await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/543794412345\?text=/);
  await expect(wa).toHaveAttribute("target", "_blank");
  await expect(wa).toHaveAttribute("rel", "noopener noreferrer");
});

test("publicar una demanda (Compro, GLP) y verla en el ranking de una planta que la acepta", async ({ page }) => {
  const name = `Secadero E2E ${Date.now()}`;
  await open(page);
  // Planta inicial: molino arrocero (cascarilla). La demanda pide cascarilla, así que entra en su ranking.
  await expect(page.getByTestId("generator-select")).toHaveAttribute("data-value", "molinos-ala-mercedes");
  const dialog = await openForm(page);

  await dialog.getByTestId("kind-demanda").click();
  await dialog.getByLabel("Nombre del establecimiento").fill(name);
  await chooseMaterial(page, "cascarilla");
  await page.getByTestId("listing-sector").click();
  await page.getByTestId("listing-sector-secadero_granos").click();
  await dialog.getByTestId("listing-alt-glp").click();
  await dialog.getByLabel(/Consumo de GLP/).fill("8");
  await dialog.getByLabel("Email").fill("compras@example.com");
  await pickOnMap(page);

  await dialog.getByTestId("publish-submit").click();
  await expect(dialog).toBeHidden();

  await expect(page.getByTestId("generator-select")).toHaveAttribute("data-value", "molinos-ala-mercedes");
  const row = page.locator('[data-testid^="buyer-row-pub-"]', { hasText: name });
  await expect(row).toBeVisible();
  await expect(row).toHaveAttribute("aria-pressed", "true");
  await expect(row.getByTestId("unverified-badge")).toBeVisible();
  await expect(page.getByTestId("result-light")).toContainText(name);

  const testId = await row.getAttribute("data-testid");
  const buyerId = testId!.replace("buyer-row-", "");
  await expect(page.locator(`[data-testid="map"] [data-marker="buyer-${buyerId}"]`)).toHaveAttribute("data-origin", "publicacion");

  // El contacto se pide desde la card del resultado; sin teléfono no hay WhatsApp, sí email.
  const info = page.getByTestId("result-light").getByTestId(`listing-info-${buyerId}`);
  await info.getByTestId("contact-reveal").click();
  await expect(info.getByTestId("contact-email")).toHaveAttribute("href", "mailto:compras@example.com");
  await expect(info.getByTestId("contact-whatsapp")).toHaveCount(0);
});

test("enviar vacío muestra los errores por campo y enfoca el primero", async ({ page }) => {
  await open(page);
  const dialog = await openForm(page);
  await dialog.getByTestId("publish-submit").click();

  const name = dialog.getByLabel("Nombre del establecimiento");
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await expect(dialog).toContainText("El nombre debe tener entre 2 y 80 caracteres");
  await expect(dialog).toContainText("Marcá la ubicación en el mapa o usá tu ubicación.");
  await expect(dialog).toContainText("Elegí el material.");
  await expect(dialog).toContainText("Las toneladas por mes deben ser un número");
  await expect(dialog).toContainText("El contacto requiere al menos un teléfono/WhatsApp o un email.");
  await expect(dialog.getByLabel("WhatsApp o teléfono")).toHaveAttribute("aria-invalid", "true");

  // Corregir un campo saca su error al instante.
  await name.fill("Aserradero Prueba");
  await expect(name).not.toHaveAttribute("aria-invalid", "true");
  await expect(dialog).not.toContainText("El nombre debe tener entre 2 y 80 caracteres");
});

test("Ver contacto en un establecimiento curado: sin datos publicados lleva a Fuentes", async ({ page }) => {
  await open(page);
  const id = await page.getByTestId("generator-select").getAttribute("data-value");
  const info = page.getByTestId(`listing-info-${id}`);
  await expect(info.getByTestId("unverified-badge")).toHaveCount(0);
  const contact = page.waitForResponse((r) => r.url().includes(`/api/listings/${id}/contact`));
  await info.getByTestId("contact-reveal").click();
  const res = await contact;
  if (res.status() === 404) {
    // Hoy los curados no tienen contacto cargado: se dice y se ofrece la fuente.
    await expect(info.getByTestId("contact-none")).toHaveText(/Sin datos de contacto publicados/);
    await info.getByRole("button", { name: "Ver fuente" }).click();
    await expect(page.getByRole("tab", { name: "Fuentes" })).toHaveAttribute("aria-selected", "true");
  } else {
    // Cuando el back sume contacto corporativo público para los curados.
    await expect(info.getByTestId("listing-contact")).toBeVisible();
  }
});
