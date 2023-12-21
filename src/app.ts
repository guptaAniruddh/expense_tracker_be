import express, { Request, Response, NextFunction, Router } from "express";
import createHttpError, { isHttpError } from "http-errors";
import sesssion from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import Env from "./utils/validateEnv";
import { cleanEnv } from "envalid";

type Envtype = ReturnType<typeof cleanEnv>;
class App {
  public app: express.Application;
  public env: Envtype;
  public routes: { router: Router }[];
  constructor(routes: { router: Router }[]) {
    this.app = express();
    this.env = new Env().validate();

    this.routes = routes;
    this.app.use(morgan("dev"));
    this.app.use(cors());
    this.app.use(express.json());
    this.sessionMiddleware();
    this.errorMiddleware();
    //
    this.initializeRoutes(this.routes);
  }
  private sessionMiddleware() {
    this.app.use(
      sesssion({
        secret: this.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 60 * 60 * 1000,
        },
        rolling: true,
        store: MongoStore.create({
          mongoUrl: this.env.MONGO_CONNECTION_STRING,
        }),
      }),
    );
  }
  private authenticationMiddleware() {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const token = req.header("token");
      if (!token) next(createHttpError(400, "Please login or sign in first"));
    });
  }

  private initializeRoutes(routes: { router: Router }[]) {
    routes.forEach((route) => {
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>', route);
      this.app.use("/", route.router);
    });
    this.endpointErrorHandler();
  }

  private endpointErrorHandler() {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(createHttpError(404, "Endpoint not found"));
    });
  }
  private errorMiddleware() {
    this.app.use(
      (err: unknown, req: Request, res: Response, next: NextFunction) => {
        try {
          let error = "An unknown error has occurred";
          let status = 500;
          if (isHttpError(err)) {
            status = err.status;
            error = err.message;
          }
          res.status(status).json({ err: error });
        } catch (err) {
          next(err);
        }
      },
    );
  }
}
export default App;
