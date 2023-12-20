import {
  IAddExpenseBody,
  IUpdateBodyExpense,
} from "../@types/expenseInterface";
import { Expense } from "../model/expense.model";
class ExpenseDao {
  private expenseModel = Expense;
  constructor() {}

  public getExpense = async (userId: string) => {
    return await this.expenseModel
      .find({ userId: userId, is_delete: false })
      .lean();
  };
  public async addExpense(
    { title, amount, date, category }: IAddExpenseBody,
    userId: string
  ) {
    console.log(userId);
    console.log(title+" "+amount+" "+date+" "+category);
    const expense = new Expense({
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
    { title, amount, date, category }: IUpdateBodyExpense
  ) {
    return await Expense.findByIdAndUpdate(
      id,
      {
        title: title,
        amount: amount,
        date: date,
        category: category,
      },
      { new: true }
    ).exec();
  }
}
export default ExpenseDao;
