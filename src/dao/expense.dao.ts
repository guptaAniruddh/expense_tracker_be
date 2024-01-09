import {
  IAddExpenseBody,
  IUpdateBodyExpense,
  iexpenseQuery,
} from "../@types/expenseInterface";
import { Expense } from "../model/expense.model";
class ExpenseDao {
  private expenseModel = Expense;
  constructor() {}

  public getExpense = async (
    userId: string,
    pageNo: number,
    pageSize: number,
    startdate: Date ,
    endate: Date,
    result: iexpenseQuery,
  ) => {
    // console.log('userId/////////', userId , pageSize, pageNo);
    const data = await this.expenseModel
      .find({
        userId: userId,
        is_delete: false,
        date: { $gte: startdate, $lte: endate },
        ...result,
      })
      .sort({ _id: -1 })
      .skip((pageNo ) * pageSize)
      .limit(pageSize)
      .lean();
    console.log(data);
    return data;
  };
  public getCount = async (userId: string) => {
    return await this.expenseModel
      .find({ userId: userId, is_delete: false })
      .countDocuments();
  };
  public async addExpense(
    { type, title, amount, date, category }: IAddExpenseBody,
    userId: string,
  ) {
    console.log(userId);
    // console.log(
    //   type + " " + title + " " + amount + " " + date + " " + category,
    // );

    const expense = new Expense({
      type: type,
      title: title,
      amount: amount,
      userId: userId,
      date: date,
      category: category,
    });
    return await expense.save();
  }
  public async getExpenseById(id: string) {
    return await Expense.findOne({ _id: id, is_delete: false }).exec();
  }
  public async deleteExpense(id: string) {
    return await Expense.updateOne({ _id: id }, { is_delete: true });
  }
  public async updateExpense(
    id: string,
    { type, title, amount, date, category }: IUpdateBodyExpense,
  ) {
    return await Expense.findByIdAndUpdate(
      id,
      {
        type: type,
        title: title,
        amount: amount,
        date: date,
        category: category,
      },
      { new: true },
    ).exec();
  }
}
export default ExpenseDao;
