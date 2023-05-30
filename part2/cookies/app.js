import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions@v4.0.5/mod.ts";
import { renderMiddleware } from "./middlewares/renderMiddleware.js";

const app = new Application();

app.use(Session.initMiddleware());
app.use(renderMiddleware);

const router = new Router();

const data = {
  items: [],
};

const listItems = async ({ render, state }) => {
  let items = await state.session.get("items");
  if (!items) {
    items = [];
  }
  data.items = items
  render("index.eta", data);
};

const addItem = async ({ request, response, state }) => {
  const body = request.body();
  const params = await body.value;
  let items = await state.session.get("items");
  if (!items) {
    items = [];
  }
  data.items.push(params.get("item"));
  await state.session.set("items", items)
  response.redirect("/");
};

router.get("/", listItems);
router.post("/", addItem);

app.use(router.routes());

if (!Deno.env.get("TEST_ENVIRONMENT")) {
  app.listen({ port: 7777 });
}

export default app;
