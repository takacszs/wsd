import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
import { configure, renderFile } from "https://deno.land/x/eta@v1.12.3/mod.ts";

configure({
  views: `${Deno.cwd()}/views/`,
});

const responseDetails = {
  headers: { "Content-Type": "text/html;charset=UTF-8" },
};

const data = {
  emperors: [],
};

const redirectTo = (path) =>
{
  return new Response(`redirecting to: ${path}`, {status: 303, headers: {Location: path}})
}

const handleFormData = async (request) => {
  const formData = await request.formData();
  data.emperors.push(formData.get("name"));
  console.log(formData)
};

const handleRequest = async (request) => {
  if (request.method === "POST") {
    await handleFormData(request);
    return redirectTo(request.url)
  }
  console.log(request.url)
  return new Response(await renderFile("index.eta", data), responseDetails);
};

serve(handleRequest, { port: 7777 });
