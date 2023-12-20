import { RequestHandler } from "express";

class IndexController {
  public index: RequestHandler = async (req, res, next) => {
    try {
      return res.status(200).json({ service: "expense-tracker" });
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
