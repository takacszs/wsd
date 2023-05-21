import { renderFile } from "https://deno.land/x/eta@v2.0.0/mod.ts";
import * as listService from "../services/listService.js";

const responseDetails = {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
};

const redirectTo = (path) => {
    return new Response(`Redirecting to ${path}.`, {
        status: 303,
        headers: {
            "Location": path,
        },
    });
};

const deactivateList = async (request) => {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const id = parts[2];
    await listService.deactivateById(id);

    return redirectTo("/lists");
};

const addList = async (request) => {
    const formData = await request.formData();
    const name = formData.get("name");

    await listService.create(name);

    return redirectTo("/lists");
};

const collectItem = async (request) => {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const id = parts[2];
    const item_id = parts[4];

    await listService.collectItem(item_id);

    return redirectTo("/lists/" + id);
};

const addItem = async (request) => {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const id = parts[2];
    const formData = await request.formData();
    const name = formData.get("name");

    await listService.createItem(name, id);

    return redirectTo("/lists/" + id);
};

const showHome = async (request) => {
    const data = {
        listNum: await listService.findAll(),
        itemNum: await listService.findAllItems(),
    };
    data.listNum = data.listNum.length;
    data.itemNum = data.itemNum.length;

    return new Response(await renderFile("index.eta", data), responseDetails);
};



const listLists = async (request) => {
    const data = {
        lists: await listService.findActive(),
    };

    return new Response(await renderFile("lists.eta", data), responseDetails);
};

const listItems = async (request) => {
    const url = new URL(request.url);
    const data = {
        list: await listService.findId(url.pathname.split("/")[2]),
        items: await listService.findItems(url.pathname.split("/")[2]),
    };

    return new Response(await renderFile("list.eta", data), responseDetails);
};

export { addList, deactivateList, listLists, showHome, listItems, addItem, redirectTo, collectItem };