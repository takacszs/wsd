import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
import { configure, renderFile } from "https://deno.land/x/eta@v1.12.3/mod.ts";

configure({
  views: `${Deno.cwd()}/views/`,
});

const responseDetails = {
  headers: { "Content-Type": "text/html;charset=UTF-8" },
};

const data = {
  songs: [],
};

const handleFormData = async (request) => {
  const formData = await request.formData();
  data.songs.push({"name": formData.get("name"), "duration": formData.get("duration")})
  console.log(data)
};

const handleRequest = async (request) => {
  if (request.method === "POST") {
    await handleFormData(request);
  }

  return new Response(await renderFile("index.eta", data), responseDetails);
};

serve(handleRequest, { port: 7777 });
