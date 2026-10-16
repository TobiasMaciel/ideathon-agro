import { expect, test } from "@playwright/test";

// Las publicaciones abiertas (origin: "publicacion") se suman al catálogo mientras la API vive: se cuentan solo los curados.
const curated = (list: { origin?: string }[]) => list.filter((x) => x.origin !== "publicacion");

test("GET /api/catalog devuelve 13 generadores y 10 compradores curados", async ({ request }) => {
  const res = await request.get("/api/catalog");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(curated(body.generators)).toHaveLength(13);
  expect(curated(body.buyers)).toHaveLength(10);
});

test("POST /api/viability válido devuelve 200", async ({ request }) => {
  const res = await request.post("/api/viability", {
    data: { generatorId: "molinos-ala-mercedes", buyerId: "duhalde-curuzu", state: "pellet" },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.result.light).toBe("verde");
});

test("POST /api/viability con cuerpo vacío devuelve 400", async ({ request }) => {
  const res = await request.post("/api/viability", { data: {} });
  expect(res.status()).toBe(400);
});
