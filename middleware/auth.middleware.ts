import {RequestHandler } from "express";
import createHttpError from "http-errors";

export class AuthMiddleware {
  constructor() {}
  public authentication :RequestHandler = (req,res,next) =>{
    
  const token = req.session.userId;
  if(!token)
  next(createHttpError(400,"Please login or signup to access this"));
else
next();
  }
}
