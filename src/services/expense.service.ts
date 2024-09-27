import mongoose from "mongoose";
import {
  IAddExpenseBody,
  IUpdateBodyExpense,
  iexpenseQuery,
} from "../@types/expenseInterface";
import ExpenseDao from "../dao/expense.dao";
import createHttpError from "http-errors";
import Joi from "joi";
import csvtojson from "csvtojson";
import UserDao from "../dao/user.dao";
// import { create } from "connect-mongo";
import R from "ramda";
import moment from "moment";
import csvParser from "json2csv";
const Json2csvParser = require("json2csv").Parser;
export default class ExpenseService {
  private expenseDao = new ExpenseDao();
  private userDao = new UserDao();
  public getExpense = async (
    userId: string|undefined,
    pageno: string | undefined,
    pagesize: string | undefined,
    queryBody: iexpenseQuery,
  ) => {
    console.log(userId);
    if (!userId) throw createHttpError(404, "Please sign up or login before");
    const pageNo: number = Number(pageno);
    const pageSize: number = Number(pagesize);
    console.log(pageNo+" "+pageSize);
    // if (!pageNo || !pageSize)
    //   throw createHttpError(400, "No pageNo and page sizes are given");
    const { type, title, amount, startdate, endate, category } = queryBody;
    // console.log(type+" "+title+" "+amount+" "+date+" "+category);
    const obj = {
      type: type,
      title: title,
      amount: amount,
      category: category,
    };

    const result = this.data(obj);
    const result2 = this.data1(result);
    console.log(obj);
    console.log(result2);
    let startDate :Date = new Date();
    let endDate:Date = new Date();
    // console.log(startdate,endate);
    if(startdate && endate){
      startDate = new Date(startdate);
      endDate = new Date(endate);
    }
    // console.log(startDate,endDate);
    // console.log(startdate,typeof(startdate));
    // console.log(endate,typeof(endate));
    const endDateNumber= endDate.setHours(23,59,59);
    endDate = new Date(endDateNumber);
    const data= await this.expenseDao.getExpense(
      userId.toString(),
      pageNo,
      pageSize,
      startDate,
      endDate,
      result2,
    );
    
    const total_count = await this.expenseDao.getCount(userId.toString());
    const formattedData = data.map((expense) => {
      return { ...expense, date: expense.date.toISOString().split("T")[0] };
    });
    

    return {
      data: formattedData,
      count: total_count,
    };
  };

  public addExpense = async (
    createExpensePayload: IAddExpenseBody,
    userId: string|undefined,
  ) => {
    if (!userId) {
      throw createHttpError(
        404,
        "You haven't login ,login first to  create Expenses",
      );
    }
    const type = createExpensePayload.type;
    const title = createExpensePayload.title;
    const amount = createExpensePayload.amount;
    const date = createExpensePayload.date;
    const category = createExpensePayload.category;
    console.log(date);
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
      userId.toString(),
    );
  };
  public getExpenseById = async (id: string, userId: string|undefined) => {
    if (!userId)
      throw createHttpError(
        404,
        "You haven't login ,login first to use the create Expenses",
      );
    const data = await this.expenseDao.getExpenseById(id);
    console.log(data);
    return data;
  };
  public updateExpense = async (
    id: string,
    { type, title, amount, date, category }: IUpdateBodyExpense,
    userId: string|undefined,
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
            -oldamount,
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
  public data = R.pipe(R.filter((param) => param!= ""));
  public data1 = R.pipe(R.filter((param)=>param!=='undefined'));
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
  public addExpenseBulk = async (userId: string|undefined, userfile:string|undefined) => {
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
              userId.toString(),
            );
            console.log(res);
          });
        }
      });
  };
  public getExpenseCsv = async (
    userId: string|undefined,
    pageno: string | undefined,
    pagesize: string | undefined,
    queryBody: iexpenseQuery,
  ) => {
    console.log("here guys");
    console.log(userId);
    if (!userId) throw createHttpError(404, "Please sign up or login before");
    const pageNo: number = Number(pageno);
    const pageSize: number = Number(pagesize);
    console.log(pageNo+" "+pageSize);
    // if (!pageNo || !pageSize)
    //   throw createHttpError(400, "No pageNo and page sizes are given");
    const { type, title, amount, startdate, endate, category } = queryBody;
    // console.log(type+" "+title+" "+amount+" "+date+" "+category);
    const obj = {
      type: type,
      title: title,
      amount: amount,
      category: category,
    };

    const result = this.data(obj);
    const result2 = this.data1(result);
    console.log(obj);
    console.log(result2);
    let startDate :Date = new Date();
    let endDate:Date = new Date();
    // console.log(startdate,endate);
    if(startdate && endate){
      startDate = new Date(startdate);
      endDate = new Date(endate);
    }
    // console.log(startDate,endDate);
    const endDateNumber = endDate.setHours(23,59,59);
    endDate = new Date(endDateNumber);
    // console.log(startdate,typeof(startdate));
    console.log(endDate);
    const data= await this.expenseDao.getExpense(
      userId.toString(),
      pageNo,
      pageSize,
      startDate,
      endDate,
      result2,
    );
    console.log("Before Csv parser");
    const csvFields = ['type','title','date','category','amount'];
    const json2csvParser= new Json2csvParser({
      csvFields,
  });
  const csvData = json2csvParser.parse(data);
const name = "expenses";
  return {
    csvData,headerToSet:`attachment;filename=${name}_${new Date()}.csv`
  }

  return csvData;
 
}
    
    // const total_count = await this.expenseDao.getCount(userId.toString());
    // const formattedData = data.map((expense) => {
    //   return { ...expense, date: expense.date.toISOString().split("T")[0] };
    // });
    

     
  }

