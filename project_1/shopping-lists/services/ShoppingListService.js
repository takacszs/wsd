import { sql } from "../database/database.js";

const createShoppingList = async (name) => {
    await sql`insert into shopping_lists(name) values(${name})`
}

const findShoppingLists = async () => {
    const rows = await sql`select * from shopping_lists`
    return rows
}

const findShoppingListById = async (Id) => {
    const rows = await sql`select * from shopping_lists where id = ${Id}`
    return rows
}

const findActiveShoppingLists = async () => {
    const rows = await sql`select * from shopping_lists where active is true`
    return rows
}

const deactivateById = async (id) => {
    await sql`update shopping_lists set active = FALSE where id = ${id}`
}

const findNumberOfShoppingLists = async () => {
    const rows = await sql`select count(*) from shopping_lists`
    return rows
}

export { findNumberOfShoppingLists, createShoppingList, findShoppingLists, deactivateById, findActiveShoppingLists, findShoppingListById }