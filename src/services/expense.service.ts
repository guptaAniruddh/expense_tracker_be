import mongoose from "mongoose";
import {
  IAddExpenseBody,
  IUpdateBodyExpense,
} from "../@types/expenseInterface";
import ExpenseDao from "../dao/expense.dao";
import createHttpError from "http-errors";
import Joi from "joi";
import csvtojson from 'csvtojson'
// import { create } from "connect-mongo";

export default class ExpenseService {
  private expenseDao = new ExpenseDao();
  public getExpense = async (userId: unknown) => {
    if (!userId) throw createHttpError(404, "Please sign up or login before");
    const data = await this.expenseDao.getExpense(userId.toString());
    const formattedData = data.map((expense) => {
      return {
        ...expense,
        date: expense.date.toISOString().split("T")[0],
      };
    });
    return formattedData;
  };

  public addExpense = async (
    createExpensePayload: IAddExpenseBody,
    userId: unknown
  ) => {
    if (!userId)
      throw createHttpError(
        404,
        "You haven't login ,login first to use the create Expenses"
      );
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
    { title, amount, date, category }: IUpdateBodyExpense,
    userId: unknown
  ) => {
    if (!userId) throw createHttpError(400, "Please sign in or login first");
    if (!mongoose.isValidObjectId(id)) {
      throw createHttpError(400, "Invalid expense id ");
    }
    if (!title && !amount && !date && !category) {
      throw createHttpError(
        404,
        "All fields of expense should consist a value"
      );
    }
    const expense = await this.expenseDao.getExpenseById(id);
    if (!expense) {
      throw createHttpError(404, "No expense found");
    }
    return await this.expenseDao.updateExpense(id, {
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
  public addExpenseBulk = async (userId:unknown ,userfile:unknown) => {
    console.log("Done till here ");
    if(!userId){
      throw createHttpError(400,"Please log in or sign up first");
    }
    if(!userfile){
      throw createHttpError(400,"File not found");
    }
    const schema = Joi.object({
      title:Joi.string().required(),
      amount:Joi.number().required(),
      date:Joi.date().required(),
      category:Joi.string().required()

    });
    
    csvtojson().fromFile(userfile.toString()).then(rows =>{
      const errors=[];
     
      rows.forEach(row=>
      {
        console.log(row);
        const value = schema.validate(row);
        if(value.error){
          value.error.details.forEach(
            (err)=>{
              console.log(err.message);
            errors.push(err.message);
            }
          )
          }
      })
       if(errors.length > 0){
        console.log(errors.length);
        throw createHttpError(400,"Csv validation failed");
        }
        else {
          rows.forEach(async(row) =>{
                  const res = await this.expenseDao.addExpense(row,userId.toString());
                 console.log(res);
        

          });
          

        }

        

    })

}
}
