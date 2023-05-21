import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.160.0/http/file_server.ts";

const handleRequest = async (request) => {
  const url = new URL(request.url)
  if (url.pathname.includes("css")) return await serveFile(request,`${Deno.cwd()}/static/styles.css`)
  else return await serveFile(request,`${Deno.cwd()}/static/index.html`)
};

serve(handleRequest, { port: 7777 });