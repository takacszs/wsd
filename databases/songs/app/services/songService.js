import { sql } from "../database.js";

const findAll = async () => 
{   
    const result = await sql`select * from songs`

    console.log(result)

    return result
}

const createSong = async (name, rating) =>{
    const result = await sql`insert into songs(name, rating) values(${name},${rating})`
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

export {findAll, createSong, removeById, findAvg}