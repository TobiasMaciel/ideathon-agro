import { expect, test } from "@playwright/test";

test("la home muestra el título del producto", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Mapa Circular NEA — ¿Cierra el negocio?");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Mapa Circular NEA — ¿Cierra el negocio?",
  );
});
