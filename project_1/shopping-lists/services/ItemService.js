import { sql } from "../database/database.js";

const createItem = async (shopping_list_id, name) => {
    await sql`insert into shopping_list_items(shopping_list_id,name) values(${shopping_list_id},${name})`
}

const findItemsByListId = async (shopping_list_id) => {
    return await sql`select * from shopping_list_items where shopping_list_id = ${shopping_list_id} order by name`
}

const setCollectedToTrue = async (id) => {
    await sql`update shopping_list_items set collected = TRUE where id = ${id}`
}

const findNumberOfItems = async () => {
    const rows = await sql`select count(*) from shopping_list_items`
    return rows
}

export { findNumberOfItems, createItem, findItemsByListId, setCollectedToTrue }