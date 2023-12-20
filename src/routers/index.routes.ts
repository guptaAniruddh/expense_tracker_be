import { Router } from "express";
import IndexController from "../controller/index.controller";

class IndexRoute {
  public path = "/health";
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.indexController.index);
  }
}

export default IndexRoute;
