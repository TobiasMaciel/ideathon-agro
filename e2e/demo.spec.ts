import { expect, test, type Page } from "@playwright/test";

const DUHALDE = "buyer-row-duhalde-curuzu";

async function open(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("generator-select")).toBeVisible();
  await expect(page.getByTestId(DUHALDE)).toBeVisible();
}

async function radiusKm(page: Page): Promise<number> {
  const text = (await page.getByTestId("radius-road-km").textContent()) ?? "";
  return parseFloat(text.replace(/[^\d,]/g, "").replace(",", "."));
}

async function openAssumptions(page: Page) {
  await page.getByRole("button", { name: /Supuestos/ }).click();
  await expect(page.getByTestId("assumption-costPerKm")).toBeVisible();
}

test("guion de la demo: del suelto al pellet", async ({ page }) => {
  await test.step("carga con marcadores y origen local", async () => {
    await open(page);
    await expect(page.locator('[data-testid="map"] path[class*="gen-"]')).toHaveCount(13);
    await expect(page.locator('[data-testid="map"] path[class*="buyer-"]')).toHaveCount(10);
    await expect(page.getByTestId("origin-badge")).toContainText("locales");
  });

  let sueltoKm = 0;
  await test.step("generador inicial en suelto: Duhalde en rojo", async () => {
    await expect(page.getByTestId("generator-select")).toHaveValue("molinos-ala-mercedes");
    await expect(page.getByTestId("state-suelto")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId(DUHALDE)).toHaveAttribute("data-light", "rojo");
    sueltoKm = await radiusKm(page);
    expect(sueltoKm).toBeGreaterThan(0);
  });

  await test.step("pellet: el radio crece más de 5 veces y Duhalde pasa a verde", async () => {
    await page.getByTestId("state-pellet").click();
    await expect(page.getByTestId("state-pellet")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId(DUHALDE)).toHaveAttribute("data-light", "verde");
    await expect.poll(() => radiusKm(page)).toBeGreaterThan(sueltoKm * 5);
  });

  await test.step("detalle de Duhalde: verde y ahorro frente a GLP", async () => {
    await page.getByTestId(DUHALDE).click();
    await expect(page.getByTestId("result-light")).toHaveAttribute("data-light", "verde");
    await expect(page.getByTestId("buyer-savings")).toContainText("GLP");
  });

  await test.step("el círculo del radio existe en el mapa", async () => {
    await expect(page.locator("path.radius-circle")).toHaveCount(1);
  });
});

test("supuestos editables: costo por km cambia el semáforo y se restablece", async ({ page }) => {
  await open(page);
  await page.getByTestId("state-pellet").click();
  await page.getByTestId(DUHALDE).click();
  await expect(page.getByTestId("result-light")).toHaveAttribute("data-light", "verde");

  await openAssumptions(page);
  await page.getByTestId("assumption-costPerKm").fill("6000");
  await expect(page.getByTestId("result-light")).toHaveAttribute("data-light", "amarillo");

  await page.getByTestId("assumptions-reset").click();
  await expect(page.getByTestId("result-light")).toHaveAttribute("data-light", "verde");
});

test("cambio de generador a un aserradero de aserrín", async ({ page }) => {
  await open(page);
  await page.getByTestId("generator-select").selectOption("todo-pallets-santa-rosa");
  await expect(page.getByTestId("generator-select")).toHaveValue("todo-pallets-santa-rosa");
  await expect(page.getByTestId("buyer-row-genergiabio-santa-rosa")).toBeVisible();
  const state = page.locator('[data-testid^="state-"][aria-checked="true"]');
  await expect(state).toHaveCount(1);
  await expect(page.getByTestId("state-suelto")).toBeEnabled();
  await expect(page.getByTestId("result-light")).toHaveAttribute("data-light", /^(verde|amarillo|rojo)$/);
});

test.describe("mobile 375x812", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("sin scroll horizontal y semáforo visible al scrollear", async ({ page }) => {
    await open(page);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(375);
    const light = page.getByTestId("result-light");
    await light.scrollIntoViewIfNeeded();
    await expect(light).toBeVisible();
    await expect(light).toBeInViewport();
  });
});
