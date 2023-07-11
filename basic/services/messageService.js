import { sql } from "../database.js";

const findAll = async () => 
{   
    const result = await sql`select * from messages`

    console.log(result)

    return result
}

const find5Recent = async () => 
{   
    const result = await sql`select * from messages order by id desc limit 5`

    console.log(result)

    return result
}

const createMsg = async (sender, message) =>{
    const result = await sql`insert into messages(sender, message) values(${sender},${message})`
    return result
}

const removeById = async (id) => {
    const result = await sql`delete from songs where id = ${id}`
    return result
}

const findAvg = async () => {
    const result = await sql`select avg(rating) from songs where rating>=0 AND rating<=1000`
    return result[0].avg
}

export {findAll, find5Recent, createMsg, removeById, findAvg}