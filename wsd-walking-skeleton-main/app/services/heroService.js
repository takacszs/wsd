import {Client} from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const client = new Client()

const runQuery = async (query) => 
{
    await client.connect()
    
    const result = await client.queryObject(query)

    await client.end()

    return result.rows
}

const findAll = async () => 
{
    const query = 'select * from hero'

    await client.connect()
    
    const result = await client.queryObject(query)

    await client.end()

    return result.rows
}

const findByName = async (name) => {
    const query = 'select * from hero where name = $name'
    await client.connect()
    const result = await client.queryObject(query,{name: name})
    await client.end()
    return result.rows;
  };

const findByNameLike = async (name) => {
    await client.connect()

    const query="select * from hero where name ilike $name"

    const likePart = `%${name}%`

    const result = await client.queryObject(query,{name: likePart})
  
    await client.end()
  
    return result.rows
  
  };
  
const create = async (name, age, actor, gender) => {
  await client.connect()
  const query='insert into hero(name, actor) values($name, $actor,)'
  const params= {name: name, actor: actor,}

  const result = await client.queryObject(query, params)

  await client.end()

  return result
};

const removeById = async (id) => {
  const query = "DELETE FROM hero WHERE id = $id";
  await client.connect()
  
  await client.queryObject(query,{id: id})

  await client.end()
}

export {findAll, findByName, findByNameLike, create, removeById, runQuery}