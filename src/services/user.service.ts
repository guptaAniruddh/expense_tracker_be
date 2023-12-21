import UserDao from "../dao/user.dao";
import { ISignUpBody, ILoginBody } from "../@types/userInterface";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
export default class userService {
  private userdao: UserDao;
  constructor() {
    this.userdao = new UserDao();
  }

  /**
   * fetch user by username
   * @param username
   * @returns
   */
  public getUserByUsername = async (username: string) => {
    return await this.userdao.getUserByUsername(username);
  };

  public getUserByEmail = async (email: string) => {
    console.log(email);
    return await this.userdao.getUserByEmail(email);
  };

  public signUp = async ({ username, email, password }: ISignUpBody) => {
    console.log(username + " " + password + " " + email);
    if (!username || !email || !password)
      throw createHttpError("400", "Parameter missing");
    const existingusername = await this.userdao.getUserByUsername(username);
    if (existingusername) {
      throw createHttpError(
        400,
        "Username already exist ,Please chhoose a different account or login instead",
      );
    }

    const existingemail = await this.userdao.getUserByEmail(email);
    if (existingemail) {
      throw createHttpError(
        400,
        "Username already exist ,Please chhoose a different account or login instead",
      );
    }

    const passwordHashed = await bcrypt.hash(password, 10);

    return this.userdao.addUser(username, email, passwordHashed);
  };
  public login = async ({ username, password }: ILoginBody) => {
    console.log(username + " " + password);
    if (!username || !password) {
      throw createHttpError(400, "Paramter missing");
    }
    const existinguser = await this.userdao.getUserWithEmailPassword(username);
    if (!existinguser) {
      throw createHttpError(401, "Invalid Credentials");
    }
    // console.log(user.password);
    const passwordMatch = await bcrypt.compare(password, existinguser.password);
    if (!passwordMatch) {
      throw createHttpError(401, "Incorrect Password");
    }
    return existinguser;
  };
  public logout = async () => {};
}
