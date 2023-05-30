import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { renderMiddleware } from "./middlewares/renderMiddleware.js";

const app = new Application();
const router = new Router();

app.use(renderMiddleware);

const data = {name: "Batman", emotion:"tired"}

const viewForm = ({ render }) => {
  render("index.eta", data);
};

const processForm = async ({request, response, render}) =>
{
  const body = request.body()
  const params = await body.value
  if (params.get("name") != "" && params.get("emotion") != "")
  {
    render("index.eta", {name: params.get("name"), emotion: params.get("emotion")})
  }
  else render("index.eta", data)
}

router.get("/", viewForm);
router.post("/", processForm)

app.use(router.routes());

if (!Deno.env.get("TEST_ENVIRONMENT")) {
  app.listen({ port: 7777 });
}

export default app;
