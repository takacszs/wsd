import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { renderMiddleware } from "./middlewares/renderMiddleware.js";
import {log} from "./middlewares/loggingMiddleware.js"

const app = new Application();
const router = new Router();

app.use(renderMiddleware);
app.use(log)
app.use(router.routes());

const hello = async ({ cookies, params, response }) => {
  if (params.path.includes("admin")) await cookies.set("admin", "true");
  else await cookies.set("admin", "false");
    response.body = "Hello world!";
  };
app.use(hello);
router.get("/:path", hello)

if (!Deno.env.get("TEST_ENVIRONMENT")) {
  app.listen({ port: 7777 });
}
export default app;