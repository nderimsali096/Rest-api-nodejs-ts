import express from "express";
import config from "config";
import connect from "./utils/connect";
import logger from "./utils/logger";
import routes from "./routes";
import bodyParser from "body-parser";

const port = config.get<number>("port");
const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.listen(port, async () => {
  logger.info(`App is running at http://localhost:${port}`);
  await connect();
  routes(app);
});

process.on("unhandledRejection", (err: any) => {
  console.log(`An error occurred: ${err.message}`);
  process.exit(1);
});
