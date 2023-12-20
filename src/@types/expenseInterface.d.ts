export interface IAddExpenseBody {
  title?: string;
  amount?: number;
  date?: Date;
  category?: string;
}
export interface IUpdateParams {
  id: string;
}
export interface IUpdateBodyExpense {
  title: string;
  amount: number;
  date: Date;
  category: string;
}
