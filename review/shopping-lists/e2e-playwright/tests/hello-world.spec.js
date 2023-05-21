const { test, expect } = require("@playwright/test");

test("Server responds with the main page.", async ({ page }) => {
  const response = await page.goto("/");
  expect(await response.text()).toHaveText("Shared shopping lists");
});

test("Lists page has expected title and headings.", async ({ page }) => {
  await page.goto("/lists");
  await expect(page).toHaveTitle("Lists");
  await expect(page.locator("h1")).toHaveText("Main page");
});

test("Can create a list", async ({ page }) => {
  await page.goto("/lists");
  const listName = `My list: ${Math.random()}`;
  await page.locator("input[type=text]").type(listName);
  await page.locator("input[type=submit]").click();
  await expect(page.locator(`a >> text='${listName}'`)).toHaveText(listName);
});

test("Items page has expected title and headings.", async ({ page }) => {
  await page.goto("/lists");
  await page.locator("a").click();
  await  await expect(page.locator("a")).toHaveText("Shopping lists");
});

test("Can create an item", async ({ page }) => {
  await page.goto("/lists/1");
  const itemName = `My item: ${Math.random()}`;
  await page.locator("input[type=text]").type(itemName);
  await page.locator("input[type=submit]").click();
  await expect(page.locator(`a >> text='${itemName}'`)).toHaveText(itemName);
});