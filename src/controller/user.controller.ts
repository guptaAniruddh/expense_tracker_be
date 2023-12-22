import { RequestHandler } from "express";
import { ISignUpBody, ILoginBody } from "../@types/userInterface";
import UserService from "../services/user.service";
import UserDao from "../dao/user.dao";
class UserController {
  private userDao: UserDao;
  private userService: UserService;
  constructor() {
    this.userDao = new UserDao();
    this.userService = new UserService();
  }
  public signUp: RequestHandler<unknown, unknown, ISignUpBody, unknown> =
    async (req, res, next) => {
      const reqBody = req.body;
      try {
        const newuser = await this.userService.signUp(reqBody);

        // this is how password is to be has
        req.session.userId = newuser._id;
        res.status(201).json(newuser);
      } catch (err) {
        next(err);
      }
    };

  public login: RequestHandler<unknown, unknown, ILoginBody, unknown> = async (
    req,
    res,
    next,
  ) => {
    const reqBody = req.body;
    try {
      const existinguser = await this.userService.login(reqBody);
      req.session.userId = existinguser._id;
      console.log(req.session.userId);
      console.log("Token set");
      res.status(201).json(existinguser);
    } catch (error) {
      next(error);
    }
  };
  public logout: RequestHandler = async (req, res, next) => {
    req.session.destroy((error) => {
      if (error) next(error);
      else res.sendStatus(201);
    });
  };

  public getUserName: RequestHandler<{ username: string }> = async (
    req,
    res,
    next,
  ) => {
    const { username } = req.params;
    try {
      const user = await this.userService.getUserByUsername(username);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };
  public getEmail: RequestHandler<{ email: string }> = async (
    req,
    res,
    next,
  ) => {
    const { email } = req.params;
    try {
      console.log(email);
      const user = await this.userService.getUserByEmail(email);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };
  public getBalance: RequestHandler<{ userId: string }> = async (
    req,
    res,
    next,
  ) => {
    const { userId } = req.params;
    try {
      const balance = await this.userService.getBalance(userId);
      res.status(200).json(balance);
    } catch (err) {
      next(err);
    }
  };
}
export default UserController;
