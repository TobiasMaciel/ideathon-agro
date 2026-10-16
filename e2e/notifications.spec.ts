import { expect, test, type Locator, type Page } from "@playwright/test";

// Notificaciones de match (F4). Dos navegadores independientes (contextos con su propio localStorage):
// A publica una oferta y ve sus matches; B publica una demanda compatible; A la recibe en la campanita.
// `?pollMs=1000` baja la consulta periódica de 20 s a 1 s solo para este test (ver pollIntervalMs en
// apps/web/src/features/notifications/poll.ts). La API guarda en memoria: nombres únicos y sin contar totales.

const URL = "/?pollMs=1000";

async function open(page: Page) {
  await page.goto(URL);
  await expect(page.getByTestId("generator-select")).toBeVisible();
  await expect(page.locator('[data-testid="map"] [data-marker^="gen-"]').first()).toBeVisible();
}

async function openForm(page: Page): Promise<Locator> {
  await page.getByTestId("publish-open").click();
  const dialog = page.getByTestId("publish-dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Marca la ubicación tocando el mapa (cerca de Mercedes, la planta inicial, dentro del NEA). */
async function pickOnMap(page: Page, dialog: Locator) {
  await dialog.getByTestId("pick-on-map").click();
  await expect(page.getByTestId("pick-banner")).toBeVisible();
  await page.getByTestId("map").click({ position: { x: 380, y: 420 } });
  await expect(dialog.getByTestId("listing-location-value")).toContainText(/° S · \d+,\d{4}° O/);
}

async function chooseMaterial(page: Page, id: string) {
  await page.getByTestId("listing-material").click();
  await page.getByTestId(`listing-material-${id}`).click();
}

test("matches al publicar y campanita con la demanda compatible de otro usuario", async ({ browser, baseURL }) => {
  // Dos publicaciones y hasta ~25 s de espera de la consulta periódica.
  test.setTimeout(90_000);
  const stamp = Date.now();
  const offerName = `Molino E2E ${stamp}`;
  const demandName = `Frigorífico E2E ${stamp}`;
  const ctxA = await browser.newContext({ baseURL });
  const ctxB = await browser.newContext({ baseURL });
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await test.step("A publica una oferta de cascarilla en Mercedes y ve los negocios que le cierran", async () => {
    await open(a);
    const dialog = await openForm(a);
    await dialog.getByLabel("Nombre del establecimiento").fill(offerName);
    await dialog.getByLabel("Localidad").fill("Mercedes");
    await chooseMaterial(a, "cascarilla");
    await dialog.getByLabel("Toneladas por mes").fill("300");
    await dialog.getByLabel("WhatsApp o teléfono").fill("3773 412345");
    await pickOnMap(a, dialog);
    await dialog.getByTestId("publish-submit").click();
    await expect(dialog).toBeHidden();

    const card = a.getByTestId("publish-matches");
    await expect(card.getByTestId("publish-matches-title")).toHaveText(/^Te cierran \d+ negocios?$/);
    // Cada fila trae "Ver contacto".
    await expect(card.getByTestId("contact-reveal").first()).toBeVisible();
    await card.getByTestId("publish-matches-close").click();
    await expect(card).toBeHidden();
  });

  await test.step("B (otro navegador) publica una demanda compatible: Compro cascarilla, GLP, frigorífico", async () => {
    await open(b);
    const dialog = await openForm(b);
    await dialog.getByTestId("kind-demanda").click();
    await dialog.getByLabel("Nombre del establecimiento").fill(demandName);
    await chooseMaterial(b, "cascarilla");
    await b.getByTestId("listing-sector").click();
    await b.getByTestId("listing-sector-frigorifico").click();
    await dialog.getByTestId("listing-alt-glp").click();
    await dialog.getByLabel(/Consumo de GLP/).fill("8");
    await dialog.getByLabel("Email").fill("compras@example.com");
    await pickOnMap(b, dialog);
    await dialog.getByTestId("publish-submit").click();
    await expect(dialog).toBeHidden();
  });

  await test.step("A: la campanita se enciende con la demanda nueva (consulta periódica)", async () => {
    // Al menos 1: otros e2e que corren en paralelo pueden publicar demandas compatibles en la misma API.
    await expect(a.getByTestId("notifications-count")).toHaveText(/^([1-9]|9\+)$/, { timeout: 25_000 });
    await expect(a.getByTestId("notice")).toContainText(/compatibles? nuevos?|Nuevo negocio compatible/);
    await a.getByTestId("notifications-bell").click();
    const item = a.locator('[data-testid^="notification-"][data-new]', { hasText: demandName });
    await expect(item).toBeVisible();
    await expect(item).toContainText(`Nueva demanda compatible: ${demandName}`);
    await item.click();
  });

  await test.step("al tocarla, el negocio queda elegido en el mapa y en el panel", async () => {
    await expect(a.getByTestId("generator-select")).toContainText(offerName);
    const row = a.locator('[data-testid^="buyer-row-pub-"]', { hasText: demandName });
    await expect(row).toHaveAttribute("aria-pressed", "true");
    await expect(a.getByTestId("result-light")).toContainText(demandName);
  });

  await ctxA.close();
  await ctxB.close();
});
