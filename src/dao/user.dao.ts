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
    });
    return await newuser.save();
  }
  public async getUserWithEmailPassword(username: string) {
    return await User.findOne({ username: username })
      .select("+password")
      .exec();
  }
  // public async getUserById(id:string){
  //     const existinguser = await User.findById(id).exec();
  //     return existinguser;
  // }
}
