import {Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { getNames, addName } from "./controllers/nameController.js";

const router = new Router();

router.get("/names", getNames)
      .post("/names", addName);

export {router}