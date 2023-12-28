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
export interface iexpenseQuery{
  type?: string;
  title?: string;
  amount?: number;
  startdate?: Date;
  endate?:Date;
  category?: string;
}

