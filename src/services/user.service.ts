import { DocumentDefinition } from 'mongoose';
import User from '../models/user.model';
import { UserDocument } from '../types/interfaces';

export async function createUser(input: DocumentDefinition<Omit<UserDocument, "createdAt" | "updatedAt" | "comparePassword">>) {
    try {
        return await User.create(input);
    } catch (error: any) {
        throw new Error(error);
    }
}