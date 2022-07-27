import express from "express";
import bodyParser from "body-parser";
import routes from "../routes";

function createServer() {
  const app = express();
  app.use(express.json());
  app.use(bodyParser.json());
  routes(app);
  return app;
}

export default createServer;
