import "dotenv/config";
import mongoose from "mongoose";
import App from "./app";
import { cleanEnv } from "envalid";
import Env from "./utils/validateEnv";
import ExternalRoutes from "./routers/external.routes";
import IndexRoute from "./routers/index.routes";
type Envtype = ReturnType<typeof cleanEnv>;
const env: Envtype = new Env().validate();
const port = env.PORT;
const app = new App([new ExternalRoutes(), new IndexRoute()]).app;
mongoose
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to mongoDB");
    app.listen(port, () => console.log("Server running on port", port));
  })
  .catch((err) => {
    console.log("Error connecting to mongoDB", err);
  });
