import { User } from "../model/user.model";
export default class UserDao {
  private user = User;
  constructor() {}
  public async getUserByUsername(username: string) {
    return await this.user.findOne({ username: username }).exec();
  }
  public async getUserByEmail(email: string) {
    return await this.user.findOne({ email: email }).exec();
  }
  public async addUser(username: string, email: string, password: string) {
    const newuser = new User({
      username: username,
      email: email,
      password,
      balance: 0,
    });
    return await newuser.save();
  }
  public async getUserWithEmailPassword(username: string) {
    return await User.findOne({ username: username })
      .select("+password")
      .exec();
  }
  public async getBalance(user_id: string) {
    const user = await User.findOne({ _id: user_id }).select("balance");
    return user;
  }
  public async addAmount(user_id: string, amount: number, balance: number) {
    balance = balance + amount;
    return await User.updateOne({ _id: user_id }, { balance: balance });
  }
  public async updateBalance(
    user_id: string,
    balance: number,
    oldamount: number,
    amount: number,
  ) {
    const newbalance: number = balance - oldamount + amount;
    return await User.updateOne({ _id: user_id }, { balance: newbalance });
  }

  // public async getUserById(id:string){
  //     const existinguser = await User.findById(id).exec();
  //     return existinguser;
  // }
}
