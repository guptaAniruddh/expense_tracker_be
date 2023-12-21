import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Credit", "Debit"],
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    is_delete: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export const Expense = mongoose.model("Expense", expenseSchema);
