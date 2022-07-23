import { TypeOf } from "zod";
import { createUserSchema } from "../schemas/user.schema";

export type CreateUserInput = Omit<TypeOf<typeof createUserSchema>, "body.passwordConfirmation">;