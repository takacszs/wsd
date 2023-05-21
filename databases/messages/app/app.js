import { serve } from "./deps.js";
import * as messageService from "./services/messageService.js"
import { configure, renderFile } from "https://deno.land/x/eta@v1.12.3/mod.ts";

configure({views: `${Deno.cwd()}/views`})

const responseDetails = {headers: { "Content-Type": "text/html;charset=UTF-8" }}

const listMessages = async () => {
  const data = {messages: await messageService.findAll()}

  const body = await renderFile("index.eta", data)
  
  const response = new Response(body, responseDetails)
  
  return response
}

const list5RecentMessages = async () => {
  const data = {messages: await messageService.find5Recent()}

  const body = await renderFile("index.eta", data)
  
  const response = new Response(body, responseDetails)
  
  return response
}

const addMessage = async (request) => {
  const formData = await request.formData()

  const sender = formData.get("sender")
  const message = formData.get("message")

  await messageService.createMsg(sender, message)
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
  if (request.method === "GET" && url.pathname == "/")
    {
    return await list5RecentMessages()
    }
  else if (request.method === "POST") 
    {
      await addMessage(request)
      return redirectTo("/")
    }
}
console.log("Launching server on port 7777");
serve(handleRequest, { port: 7777 });