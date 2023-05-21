import * as itemService from "../services/ItemService.js"
import * as shoppingListService from "../services/ShoppingListService.js"
import {
  renderFile,
  configure
} from "../deps.js"

const responseDetails = {
  headers: {
    "Content-Type": "text/html;charset=UTF-8"
  },
};

configure({
  views: `${Deno.cwd()}/views`
})

const AddItemToShoppingList = async (shopping_list_id, name) => {
  await itemService.createItem(shopping_list_id, name)
}

const ViewItemsOfShoppingList = async (shopping_list_id) => {
  const data = {
    items: await itemService.findItemsByListId(shopping_list_id),
    shoppingList: await shoppingListService.findShoppingListById(shopping_list_id)
  }
  return new Response(await renderFile("items.eta", data), responseDetails)
}

const SetItemToCollected = async (id) => {
  await itemService.setCollectedToTrue(id)
}

const ViewStats = async () => {
  const data = {
    numOfShoppingLists: await shoppingListService.findNumberOfShoppingLists(),
    numOfItems: await itemService.findNumberOfItems()
  }
  return new Response(await renderFile("index.eta", data), responseDetails)
}

export {
  ViewStats,
  AddItemToShoppingList,
  ViewItemsOfShoppingList,
  SetItemToCollected
}