import { serve } from "https://deno.land/std@0.171.0/http/server.ts";
import { configure } from "https://deno.land/x/eta@v2.0.0/mod.ts";
import * as listController from "./controllers/listController.js";

configure({
    views: `${Deno.cwd()}/views/`,
});

const responseDetails = {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
};

const handleRequest = async (request) => {
    const url = new URL(request.url);
    if (request.method === "GET") {
        if(url.pathname === "/"){
            return await listController.showHome(request);
        }else if(url.pathname === "/lists"){
            return await listController.listLists(request);
        }else if(url.pathname.split("/")[1] === "lists" && url.pathname.split("/").length === 3){
            return await listController.listItems(request);
        }else{
            return listController.redirectTo("/");
        }
    } else if (request.method === "POST") {
        if(url.pathname === "/lists"){
            return await listController.addList(request);
        }else if(url.pathname.split("/")[url.pathname.split("/").length-1] === "deactivate"){ //last parameter of request
            return await listController.deactivateList(request);
        }else if(url.pathname.split("/")[url.pathname.split("/").length-1] === "items"){
            return await listController.addItem(request);
        }else if(url.pathname.split("/")[url.pathname.split("/").length-1] === "collect"){
            return await listController.collectItem(request);
        }else{
            return listController.redirectTo("/");
        }
        //await addMessage(request);
        //return listController.redirectTo("/");
    }
};

serve(handleRequest, { port: 7777 });