import { expect, test, type Page } from "@playwright/test";

const html = (page: Page) => page.locator("html");
const baseTile = (page: Page) => page.locator(".tiles-base img.leaflet-tile").first();

test("tema: claro por defecto, se alterna, persiste al recargar y cambia los tiles del mapa", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("generator-select")).toBeVisible();

  await test.step("sin preferencia guardada: claro, con el mapa gris claro", async () => {
    await expect(html(page)).toHaveAttribute("data-theme", "light");
    await expect(baseTile(page)).toHaveAttribute("src", /World_Light_Gray_Base/);
    await expect(page.getByTestId("theme-toggle")).toHaveAttribute("aria-label", "Cambiar a modo oscuro");
  });

  await test.step("alternar: oscuro, con el mapa gris oscuro", async () => {
    await page.getByTestId("theme-toggle").click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    await expect(page.getByTestId("theme-toggle")).toHaveAttribute("aria-label", "Cambiar a modo claro");
    await expect(baseTile(page)).toHaveAttribute("src", /World_Dark_Gray_Base/);
  });

  await test.step("persiste al recargar", async () => {
    await page.reload();
    await expect(page.getByTestId("generator-select")).toBeVisible();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    await expect(baseTile(page)).toHaveAttribute("src", /World_Dark_Gray_Base/);
  });

  await test.step("volver a claro", async () => {
    await page.getByTestId("theme-toggle").click();
    await expect(html(page)).toHaveAttribute("data-theme", "light");
    await expect(baseTile(page)).toHaveAttribute("src", /World_Light_Gray_Base/);
  });
});
