import { Request, Response } from "express";
import { createSession } from "../services/session.service";
import { validatePassword } from "../services/user.service";

export async function createUserSessionHandler(req: Request, res: Response) {
  // Validate the user's password
  const user = await validatePassword(req.body);
  if (!user) return res.status(401).send("Invalid username or password");

  // Create a session
  const session = createSession(user._id, req.get("user-agent") || "");
  // Create an access token

  // Create a refresh token

  // return access and refresh tokens
}
