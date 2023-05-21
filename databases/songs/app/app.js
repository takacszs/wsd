import { serve } from "./deps.js";
import { sql } from "./database.js";
import * as songService from "./services/songService.js"
import { configure, renderFile } from "https://deno.land/x/eta@v1.12.3/mod.ts";

configure({views: `${Deno.cwd()}/views`})

const responseDetails = {headers: { "Content-Type": "text/html;charset=UTF-8" }}

const listSongsinTable = async () => {
  const data = {songs: await songService.findAll()}

  const body = await renderFile("index.eta", data)
  
  const response = new Response(body, responseDetails)
  
  return response
}

// copied from the assignment, it shouldnt be measurement it should be songs 
const listAvg = async () => {
  let data
  const avg = await songService.findAvg()
  if (avg) data = {body: `Measurement average: ${avg}` };
  else data = {body: `Measurement average: ${avg}` };
  return new Response(await renderFile("avg.eta", data), responseDetails);
}

const addSong = async (request) => {
  const formData = await request.formData()

  const name = formData.get("name")
  const rating = formData.get("rating")

  await songService.createSong(name, rating)
}

//path: /delete/id
const deleteSong = async (request) =>
  {
    const url = new URL(request.url)
    const pathParts = url.pathname.split("/")
    const id = pathParts[2]
    await songService.removeById(id)
  }

const redirectTo = (path) => {
  return new Response(`Redirecting to ${path}`,{status: 303, headers: {"Location": path}})
}

const handleRequest = async (request) => {
  console.log(`Request to ${request.url}`);
  
  const url = new URL(request.url)
  if (request.method === "GET" && url.pathname.startsWith("/songs"))
    {
    return await listSongsinTable()
  }
  else if (request.method === "POST" && url.pathname.includes("/delete"))
    {
      try {
        await deleteSong(request)
      } catch (error) {
        console.log("error:")
        console.log(error)
      }
      return redirectTo("/songs")
    }
  else if (request.method === "POST" && url.pathname === ("/songs"))
    {
      await addSong(request)
      return redirectTo("/songs")
    }
  else return redirectTo("/songs")
};

console.log("Launching server on port 7777");
serve(handleRequest, { port: 7777 });