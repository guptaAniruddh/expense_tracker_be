import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  balance: {
    type: Number,
    required: true,
    select: false,
  },
});

export const User = mongoose.model("Users", userSchema);
