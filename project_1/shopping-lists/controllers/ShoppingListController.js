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

const ViewShoppingLists = async () => {
  const data = {
    shoppingLists: await shoppingListService.findShoppingLists()
  }
  return new Response(await renderFile("shopping_lists.eta", data), responseDetails)
}

const ViewActiveShoppingLists = async () => {
  const data = {
    shoppingLists: await shoppingListService.findActiveShoppingLists()
  }
  return new Response(await renderFile("shopping_lists.eta", data), responseDetails)
}

const ViewShoppingListById = async (Id) => {
  return await shoppingListService.findShoppingListById(Id)
}

const AddNewShoppingList = async (name) => {
  await shoppingListService.createShoppingList(name)
}

const DeactivateShoppingList = async (id) => {
  await shoppingListService.deactivateById(id)
}

export {
  ViewShoppingLists,
  ViewActiveShoppingLists,
  AddNewShoppingList,
  DeactivateShoppingList,
  ViewShoppingListById
}