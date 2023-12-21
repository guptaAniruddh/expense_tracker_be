export interface IAddExpenseBody {
  type?: string;
  title?: string;
  amount?: number;
  date?: Date;
  category?: string;
}
export interface IUpdateParams {
  id: string;
}
export interface IUpdateBodyExpense {
  type?: string;
  title?: string;
  amount?: number;
  date?: Date;
  category?: string;
}
