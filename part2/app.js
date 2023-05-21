import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { renderMiddleware } from "./middlewares/renderMiddleware.js";

const app = new Application();
const router = new Router();
app.use(renderMiddleware);

const viewStory = ({ render, params }) => {
  console.log(params)
  render("index.eta", params);
};

router.get("/name/:name/emotion/:emotion", viewStory); // params!!

app.use(router.routes());

if (!Deno.env.get("TEST_ENVIRONMENT")) {
  app.listen({ port: 7777 });
}

export default app;
