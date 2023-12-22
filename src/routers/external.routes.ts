import express from "express";
import UserController from "../controller/user.controller";
import ExpenseController from "../controller/expense.controller";
import { upload } from "../../middleware/multer.middleware";
import { AuthMiddleware } from "../../middleware/auth.middleware";
export default class ExternalRoutes {
  public router: express.Router;
  private userController: UserController;
  private expenseController: ExpenseController;
  private path: string;
  private authMiddleware: AuthMiddleware;
  constructor() {
    this.router = express.Router();
    this.path = "/api/external";
    this.authMiddleware = new AuthMiddleware();
    this.userController = new UserController();
    this.expenseController = new ExpenseController();
    this.initialiseExpenseRoutes(`${this.path}/expenses`);
    this.initialiseUserRoutes(`${this.path}/user`);
  }

  public initialiseExpenseRoutes(prefix: string) {
    this.router.post(
      `${prefix}/import_csv`,
      upload.single("csv_file"),
      this.authMiddleware.authentication,
      this.expenseController.addExpenseBulk,
    );
    this.router.get(
      `${prefix}/:id`,
      this.authMiddleware.authentication,
      this.expenseController.getExpenseById,
    );
    this.router.get(
      `${prefix}/`,
      this.authMiddleware.authentication,
      this.expenseController.getExpense,
    );
    this.router.put(`${prefix}/:id`, this.expenseController.updateExpense);
    this.router.post(
      `${prefix}`,
      this.authMiddleware.authentication,
      this.expenseController.addExpense,
    );
    this.router.delete(
      `${prefix}/:id`,
      this.authMiddleware.authentication,
      this.expenseController.deleteExpense,
    );
  }

  public initialiseUserRoutes(prefix: string) {
    this.router.post(`${prefix}/signup`, this.userController.signUp);
    this.router.post(`${prefix}/login`, this.userController.login);
    this.router.post(`${prefix}/logout`, this.userController.logout);
    this.router.get(
      `${prefix}/get_balance/:userId`,
      this.userController.getBalance,
    );
    this.router.get(
      `${prefix}/username/:username"`,
      this.userController.getUserName,
    );
    this.router.get(`${prefix}/email/:email`, this.userController.getEmail);
  }
}
