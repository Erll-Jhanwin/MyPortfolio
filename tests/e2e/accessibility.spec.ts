import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/projects", "/about", "/services", "/resume", "/contact", "/privacy", "/terms", "/refunds", "/cookies", "/privacy-request"]) {
  test(`axe WCAG scan: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations.map(({ id, impact, description, nodes }) => ({ id, impact, description, count: nodes.length })))).toEqual([]);
  });
}

test("cookie preferences dialog is accessible", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Cookie preferences" }).click();
  await expect(page.getByRole("dialog", { name: "Cookie preferences" })).toBeVisible();
  const results = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations.map(({ id, impact, description, nodes }) => ({ id, impact, description, count: nodes.length })))).toEqual([]);
});
