const { test, expect } = require("@playwright/test");

test("NOT A TEST, just sleep for 3 secs to wait for the webapp container to start serving content", async ({ page }) => {
  await page.waitForTimeout(3000);
});

//1
test("list added when clicking on 'Create list!'", async ({ page }) => {
  await page.goto("/lists");
  const listName = `list-${Math.random()}`
  await page.getByLabel('')
  await page.locator("input[type=text]").type(listName)
  await page.getByRole('button', { name: 'Create list!' }).click()
  await expect(page.locator(`a >> text='${listName}'`)).toContainText(listName);
});

//2
test("item added when clicking on 'Add item!'", async ({ page }) => {
  // first create list
  await page.goto("/lists");
  const listName = `list-${Math.random()}`
  await page.locator("input[type=text]").type(listName)
  await page.getByRole('button', { name: 'Create list!' }).click()

  // navigate to the page of the list
  await page.locator((`a >> text='${listName}'`)).click()

  // add new item
  const itemName = `item-${Math.random()}`
  await page.locator("input[type=text]").type(itemName)
  await page.getByRole('button', { name: 'Add item!' }).click()

  //check if it's there
  await expect(page.locator(`li >> text='${itemName}'`)).toContainText(itemName);
});

//3
test("Clicking on a single shopping list shows its page", async ({ page }) => {
  // first create list
  await page.goto("/lists");
  const listName = `list-${Math.random()}`
  await page.locator("input[type=text]").type(listName)
  await page.getByRole('button', { name: 'Create list!' }).click()

  // navigate to the page of the list
  await page.locator((`a >> text='${listName}'`)).click()

  // check if the name of the list is shown as a h2 header
  await expect(page.locator("h2")).toHaveText(listName)
});


//4
test("Item gets crossed when clicking on 'Mark Collected!'", async ({ page }) => {
  // first create list
  await page.goto("/lists");
  const listName = `list-${Math.random()}`
  await page.getByLabel('')
  await page.locator("input[type=text]").type(listName)
  await page.getByRole('button', { name: 'Create list!' }).click()

  // navigate to the newly created list's page
  await page.locator((`a >> text='${listName}'`)).click()

  // add 3 items to the newly created list
  // (1)
  var itemName = "item-10001"
  await page.locator("input[type=text]").type(itemName)
  await page.getByRole('button', { name: 'Add item!' }).click()

  // (2)
  itemName = "item-10003"
  await page.locator("input[type=text]").type(itemName)
  await page.getByRole('button', { name: 'Add item!' }).click()

  // (3)
  itemName = "item-10002"
  await page.locator("input[type=text]").type(itemName)
  await page.getByRole('button', { name: 'Add item!' }).click()

  // Mark item-10002 collected
  const listitem = await page.locator(`li >> text='${itemName}'`)
  await listitem.getByRole('button', { name: 'Mark Collected!' }).click()

  // Check if it was crossed
  await expect(page.locator("del")).toHaveText(itemName)
});

//5
test("List disappears when clicking on 'Deactivate list!'", async ({ page }) => {
  // first create list
  await page.goto("/lists");
  const listName = `list-${Math.random()}`
  await page.locator("input[type=text]").type(listName)
  await page.getByRole('button', { name: 'Create list!' }).click()

  // deactivate list
  await page.getByTestId(listName).click()

  await expect(page.locator(`a >> text='${listName}'`)).not.toBeVisible()
});