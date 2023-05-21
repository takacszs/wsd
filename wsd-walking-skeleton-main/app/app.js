import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
import { configure, renderFile } from "https://deno.land/x/eta@v1.12.3/mod.ts";
import * as heroService from "./services/heroService.js" 

configure({views: `${Deno.cwd()}/views`})

const responseDetails = {headers: { "Content-Type": "text/html;charset=UTF-8" }}

const listHeroes = async () => {
  const data = {heroes: await heroService.findAll()}

  const body = await renderFile("index.eta", data)
  
  const response = new Response(body, responseDetails)
  
  return response
}

const addHero = async (request) => {
  const formData = await request.formData()

  const name = formData.get("name")
  const age = formData.get("age")
  const gender = formData.get("gender")
  const actor = formData.get("actor")

  await heroService.create(name, age, actor, gender)
}

const redirectTo = (path) => {
  return new Response(`Redirecting to ${path}`,{status: 303, headers: {"Location": path}})
}

//path: /delete/id
const deleteAddress = async (request) =>
  {
    const url = new URL(request.url)
    const pathParts = url.pathname.split("/")
    const id = pathParts[2]
    await heroService.removeById(id)
  }

const handleRequest = async (request) => 
  {
    const url = new URL(request.url)
    if (request.method === "POST" && url.pathname.startsWith("/delete/"))
    {
      await deleteAddress(request)
      return redirectTo("/")
    }
    else if (request.method === "POST")
    {
      await addHero(request)
      return redirectTo("/")
    } 
    else return await listHeroes()
    }

serve(handleRequest, {port: 7777})