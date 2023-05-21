import { serve } from "./deps.js";
import * as shoppingListController from "./controllers/ShoppingListController.js"
import * as requestUtils from "./utils/requestUtils.js"
import * as itemController from "./controllers/ItemController.js"

const handleRequest = async (request) => {
  const url = new URL(request.url);
  console.log(` '${request.method}' request to ${url.pathname}`)

  if (url.pathname === "/" && request.method === "GET") {
    return await itemController.ViewStats()
  }
  else if (url.pathname === "/lists" && request.method === "GET") {
    return await shoppingListController.ViewActiveShoppingLists()
  }
  else if (url.pathname === "/" && request.method === "GET") {
    return requestUtils.redirectTo("/lists");
  }
  else if (url.pathname === "/lists" && request.method === "POST") {
    const formData = await request.formData()
    const name = formData.get("name")
    await shoppingListController.AddNewShoppingList(name)
    return requestUtils.redirectTo("/lists");
  }
  else if (url.pathname.match("/lists/[0-9]+/deactivate") && request.method === "POST") {
    const path = url.pathname.split("/")
    const idToDeactive = path[2]
    await shoppingListController.DeactivateShoppingList(idToDeactive)
    return requestUtils.redirectTo("/lists");
  }
  else if (url.pathname.match("/lists/[0-9]+") && request.method === "GET") {
    const path = url.pathname.split("/")
    const shoppingListId = path[2]
    return await itemController.ViewItemsOfShoppingList(shoppingListId)
  }
  else if (url.pathname.match("/lists/[0-9]+/items/[0-9]+/collect") && request.method === "POST") {
    const path = url.pathname.split("/")
    const shoppingListId = path[2]
    const itemId = path[4]
    await itemController.SetItemToCollected(itemId)
    return requestUtils.redirectTo(`/lists/${shoppingListId}`)
  }
  else if (url.pathname.match("/lists/[0-9]+/items") && request.method === "POST") {
    const path = url.pathname.split("/")
    const shoppingListId = path[2]
    const formData = await request.formData()
    const itemName = formData.get("name")
    await itemController.AddItemToShoppingList(shoppingListId, itemName)
    return requestUtils.redirectTo(`/lists/${shoppingListId}`)
  }

}
serve(handleRequest, {
  port: 7777
});