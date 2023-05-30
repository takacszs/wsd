import { sql } from "../database/database.js";

const add = async (content) => {
  await sql`INSERT INTO tickets (content, reported_on) VALUES (${ content }, NOW())`;
};

const resolve = async (id) => {
await sql`UPDATE tickets SET resolved_on=NOW() WHERE id = ${id};`;
};

const remove = async (id) => {
await sql`DELETE from tickets WHERE id = ${id};`;
};


const findAll = async () => {
  return await sql`SELECT * FROM tickets`;
};

export { add, findAll, resolve, remove };