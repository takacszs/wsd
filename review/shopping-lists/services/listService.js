import { executeQuery } from "../database/database.js";

const create = async (name) => {
    let result = await executeQuery("INSERT INTO shopping_lists (name) VALUES ($name);", {name: name});
  return result.rows;
};

const createItem = async (name, id) => {
    let result = await executeQuery("INSERT INTO shopping_list_items (shopping_list_id, name) VALUES ($id , $name );",{id: id, name: name});
  return result.rows;
};

const deactivateById = async (id) => {
    let result = await executeQuery("UPDATE shopping_lists SET active = 'false' WHERE id = ($id);", {id: id});
  return result.rows;
}

const findAll = async () => {
    let result = await executeQuery("SELECT * FROM shopping_lists;");
  return result.rows;
}

const findAllItems = async () => {
    let result = await executeQuery("SELECT * FROM shopping_list_items;");
  return result.rows;
}

const collectItem = async (id) => {
    let result = await executeQuery("UPDATE shopping_list_items SET collected = 'true' WHERE id = ($id);", {id: id});
  return result.rows;
}

const findId = async (id) => {
    let result = await executeQuery("SELECT * FROM shopping_lists WHERE id = ($id);", {id: id});
  return result.rows;
}

const findItems = async (listId) => {
    let result = await executeQuery("SELECT * FROM shopping_list_items WHERE shopping_list_id = ($listId) ORDER BY collected ASC, name;", {listId: listId});
  return result.rows;
}

const findActive = async () => {
    let result = await executeQuery("SELECT * FROM shopping_lists WHERE active=true;");
  return result.rows;
}



export { create, findAll, findActive, deactivateById, findId, findItems, createItem, collectItem, findAllItems };