import { RequestHandler } from "express";
import {
  IAddExpenseBody,
  IUpdateBodyExpense,
  IUpdateParams,
} from "../@types/expenseInterface";
import ExpenseService from "../services/expense.service";
class ExpenseController {
  private expenseService = new ExpenseService();
  public getExpense: RequestHandler = async (req, res, next) => {
    try {
      const userId = req.session.userId;

      console.log(userId);
      const expenses = await this.expenseService.getExpense(userId);
      res.status(200).json(expenses);
    } catch (err) {
      next(err);
    }
  };

  public addExpense: RequestHandler<
    unknown,
    unknown,
    IAddExpenseBody,
    unknown
  > = async (req, res, next) => {
    const reqBody = req.body;

    try {
      const userId = req.session.userId;
      console.log(userId);
      const expense = await this.expenseService.addExpense(reqBody, userId);
      res.status(201).json(expense);
    } catch (err) {
      next(err);
    }
  };

  public getExpenseById: RequestHandler<{ id: string }> = async (
    req,
    res,
    next,
  ) => {
    const { id: expenseId } = req.params;
    try {
      const userId = req.session.userId;
      const expense = await this.expenseService.getExpenseById(
        expenseId,
        userId,
      );
      res.status(200).json(expense);
    } catch (err) {
      next(err);
    }
  };

  public updateExpense: RequestHandler<
    IUpdateParams,
    unknown,
    IUpdateBodyExpense,
    unknown
  > = async (req, res, next) => {
    const { id: id } = req.params;
    const reqBody = req.body;
    try {
      const userId = req.session.userId;
      const newExpense = await this.expenseService.updateExpense(
        id,
        reqBody,
        userId,
      );
      res.status(200).json(newExpense);
    } catch (err) {
      next(err);
    }
  };
  public deleteExpense: RequestHandler = async (req, res, next) => {
    const id = req.params.id;
    try {
      const userId = req.session.userId;
      const expense = await this.expenseService.deleteExpense(id, userId);
      res.status(200).json(expense);
    } catch (err) {
      next(err);
    }
  };
  public addExpenseBulk: RequestHandler = async (req, res, next) => {
    console.log("file uploaded successfully");
    try {
      const file = req.file?.path;
      const userId = req.session.userId;
      console.log(userId);
      await this.expenseService.addExpenseBulk(userId, file);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  };
}
export default ExpenseController;
