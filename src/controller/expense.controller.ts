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
      const userId = req.header("token");

      console.log(userId);
      const page = req.header('pageNo');
      const pageSize = req.header('pageSize');
      console.log(page+" "+pageSize);
      const expenses = await this.expenseService.getExpense(userId,page,pageSize);
      console.log(expenses);
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
      const userId = req.header("token");
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
      const userId = req.header("token");
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
      const userId = req.header("token");
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
      const userId = req.header("token");
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
      const userId = req.header("token");
      console.log(userId);
      
      const result = await this.expenseService.addExpenseBulk(userId, file);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
export default ExpenseController;
