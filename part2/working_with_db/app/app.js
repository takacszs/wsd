import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { renderMiddleware } from "./middlewares/renderMiddleware.js";
import {log} from "./middlewares/loggingMiddleware.js"
import * as nameService from "./services/nameService.js"

const app = new Application();
const router = new Router();

app.use(renderMiddleware);
app.use(log)

const listTickets = async ({ render }) => {
  render("index.eta", { tickets: await nameService.findAll() });
};

const addTicket = async ({request, response}) => {
  const body = await request.body()
  const params = await body.value
  await nameService.add(params.get("content"))
  response.redirect("/tickets")
}

const resolve = async ({params, response}) => {
  await nameService.resolve(params.id)
  response.redirect("/tickets")
}

const remove = async ({params, response}) => {
  await nameService.remove(params.id)
  response.redirect("/tickets")
}

router.get("/tickets", listTickets);
router.post("/tickets", addTicket)
router.post("/tickets/:id/resolve", resolve)
router.post("/tickets/:id/delete", remove)

app.use(router.routes());

if (!Deno.env.get("TEST_ENVIRONMENT")) {
  app.listen({ port: 7777 });
}

export default app;