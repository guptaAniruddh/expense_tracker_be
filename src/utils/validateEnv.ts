import { cleanEnv } from "envalid";
import { str, port } from "envalid";

class Env {
  public validate() {
    return cleanEnv(process.env, {
      MONGO_CONNECTION_STRING: str(),
      PORT: port(),
      SESSION_SECRET: str(),
    });
  }
}
export default Env;
