import mongoose from "mongoose";
import {
  IAddExpenseBody,
  IUpdateBodyExpense,
} from "../@types/expenseInterface";
import ExpenseDao from "../dao/expense.dao";
import createHttpError from "http-errors";
import Joi from "joi";
import csvtojson from "csvtojson";
import UserDao from "../dao/user.dao";
// import { create } from "connect-mongo";

export default class ExpenseService {
  private expenseDao = new ExpenseDao();
  private userDao = new UserDao();
  public getExpense = async (
    userId: unknown,
    pageno: string | undefined,
    pagesize: string | undefined
  ) => {
    if (!userId) throw createHttpError(404, "Please sign up or login before");
    const pageNo: number = Number(pageno);
    const pageSize: number = Number(pagesize);
    if (!pageNo || !pageSize)
      throw createHttpError(400, "No pageNo and page sizes are given");
    const data = await this.expenseDao.getExpense(
      userId.toString(),
      pageNo,
      pageSize
    );
    const total_count = await this.expenseDao.getCount(userId.toString());
    const formattedData = data.map((expense) => {
      return { ...expense, date: expense.date.toISOString().split("T")[0] }});

    return {
      data: formattedData,
      count: total_count
    };
  };

  public addExpense = async (
    createExpensePayload: IAddExpenseBody,
    userId: unknown
  ) => {
    if (!userId) {
      throw createHttpError(
        404,
        "You haven't login ,login first to  create Expenses"
      );
    }
    const type = createExpensePayload.type;
    const title = createExpensePayload.title;
    const amount = createExpensePayload.amount;
    const date = createExpensePayload.date;
    const category = createExpensePayload.category;
    if (!type || !title || !amount || !date || !category) {
      throw createHttpError(400, "All fields are mandatory and required");
    }
    const user = await this.userDao.getBalance(userId.toString());
    let balance: number = 0;
    if (user) balance = user.balance;
    console.log(balance);
    // user.then((data)=>{
    //   const bal = data?.balance;
    //   console.log( "We are inside data and printing this"+bal);
    //   if(bal){
    //     // console.log(bal);
    //   balance = bal;
    //   }
    // });

    // console.log(balance + " "+amount);
    let am = Number(amount);
    if (type == "Debit") {
      console.log(type);
      am = -am;
    }

    this.userDao.addAmount(userId.toString(), am, balance);
    return await this.expenseDao.addExpense(
      { ...createExpensePayload },
      userId.toString()
    );
  };
  public getExpenseById = async (id: string, userId: unknown) => {
    if (!userId)
      throw createHttpError(
        404,
        "You haven't login ,login first to use the create Expenses"
      );
    return await this.expenseDao.getExpenseById(id);
  };
  public updateExpense = async (
    id: string,
    { type, title, amount, date, category }: IUpdateBodyExpense,
    userId: unknown
  ) => {
    if (!userId) throw createHttpError(400, "Please sign in or login first");
    if (!mongoose.isValidObjectId(id)) {
      throw createHttpError(400, "Invalid expense id ");
    }
    if (!type && !title && !amount && !date && !category) {
      throw createHttpError(400, "You have to edit at least one field");
    }
    const expense = await this.expenseDao.getExpenseById(id);
    if (!expense) {
      throw createHttpError(404, "No expense found");
    }
    if (type) {
      let balance: number = 0;
      const user = await this.userDao.getBalance(userId.toString());
      if (user) balance = user.balance;
      let oldamount: number = expense.amount;
      if (expense.type == "Debit") oldamount = -oldamount;

      if (amount) {
        amount = Number(amount);
        let val: number = amount;
        if (type && type === "Debit") val = -amount;
        console.log(oldamount + " " + typeof oldamount);
        console.log(amount);
        this.userDao.updateBalance(userId.toString(), balance, oldamount, val);
        amount = Math.abs(amount);
      } else {
        if (expense.type != type)
          this.userDao.updateBalance(
            userId.toString(),
            balance,
            oldamount,
            -oldamount
          );
      }
    }

    return await this.expenseDao.updateExpense(id, {
      type,
      title,
      amount,
      date,
      category,
    });
  };
  public deleteExpense = async (id: string, userId: unknown) => {
    if (!userId) throw createHttpError(400, "Please log in or sign in first");
    if (!mongoose.isValidObjectId(id)) {
      throw createHttpError(400, "Invalid expense id ");
    }
    const expense = await this.expenseDao.getExpenseById(id);
    if (!expense) {
      throw createHttpError(404, "No expense found");
    }
    return await this.expenseDao.deleteExpense(id);
  };
  public addExpenseBulk = async (userId: unknown, userfile: unknown) => {
    console.log("Done till here ");
    if (!userId) {
      throw createHttpError(400, "Please log in or sign up first");
    }
    if (!userfile) {
      throw createHttpError(400, "File not found");
    }
    const schema = Joi.object({
      type: Joi.string().required(),
      title: Joi.string().required(),
      amount: Joi.number().required(),
      date: Joi.date().required(),
      category: Joi.string().required(),
    });

    csvtojson()
      .fromFile(userfile.toString())
      .then((rows) => {
        const errors = [];

        rows.forEach((row) => {
          console.log(row);
          const value = schema.validate(row);
          if (value.error) {
            value.error.details.forEach((err) => {
              console.log(err.message);
              errors.push(err.message);
            });
          }
        });
        if (errors.length > 0) {
          console.log(errors.length);
          throw createHttpError(400, "Csv validation failed");
        } else {
          rows.forEach(async (row) => {
            const res = await this.expenseDao.addExpense(
              row,
              userId.toString()
            );
            console.log(res);
          });
        }
      });
  };
}
