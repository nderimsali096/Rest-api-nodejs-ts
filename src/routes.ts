import { Express, Request, Response } from "express";
import { createUserHandler } from "./controllers/user.controller";
import validate from "./middlewares/validateResource";
import { createUserSchema } from "./schemas/user.schema";

function routes(app: Express) {
  app.get("/test", (req: Request, res: Response) => res.sendStatus(200));

  app.post("/api/users", validate(createUserSchema), createUserHandler);
}

export default routes;
