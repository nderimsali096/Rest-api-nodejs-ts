import jwt, { JwtPayload } from "jsonwebtoken";
import config from "config";
import { Request, Response, NextFunction } from "express";

export const verifyToken = (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  // Check if the request has BEARER token
  if (!req.headers.authorization && req.originalUrl !== "/api/users/login")
    return res
      .status(401)
      .send("There is no bearer token attached to the request");

  const token = req.headers.authorization.split(" ")[1];
  const publicKey = config.get<string>("secretKey");

  // Check if the token is valid
  if (!token) {
    return res.status(403).send("A valid token is required for authentication");
  }
  try {
    const decoded: string | JwtPayload | any = jwt.verify(token, publicKey);

    // If user is already logged in we save a property so we can use it later
    if (decoded.username === req.body.username) req.userActive = true;

    req.user = decoded;
  } catch (err: any) {
    return res.status(401).send(err);
  }
  return next();
};
