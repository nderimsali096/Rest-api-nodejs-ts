import { Request, Response } from 'express';
import { omit } from "lodash";

import { createUser } from '../services/user.service';
import { CreateUserInput } from '../types/types';
import logger from "../utils/logger";

export async function createUserHandler(req: Request<{}, {}, CreateUserInput["body"]>, res: Response) {
    try {
        const user = await createUser(req.body);
        return res.send(omit(user.toJSON(), "password"));
    } catch (error: any) {
        logger.error(`Conflict on creating user: ${error}`);
        return res.status(409).send(error.message);
    }
}