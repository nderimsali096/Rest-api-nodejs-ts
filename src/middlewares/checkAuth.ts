import jwt from "jsonwebtoken";
import config from "config";
import { Request, Response, NextFunction } from "express";

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization.split(" ")[1];
  const publicKey = config.get<string>("secretKey");
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, publicKey);
    req.user = decoded;
  } catch (err: any) {
    return res.status(401).send(err);
  }
  return next();
};
