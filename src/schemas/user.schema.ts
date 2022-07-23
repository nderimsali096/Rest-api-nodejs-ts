import { number, object, string } from 'zod';
export const createUserSchema: any = object({
    body: object({
        username: string({
            required_error: "Username is required"
        }),
        password: string({
            required_error: "Password is required"
        }).min(6, "Password too short - should be minimum 6 chars"),
        passwordConfirmation: string({
            required_error: "passwordConfirmation is required"
        }),
        deposit: number({
            required_error: "Deposit should be at least 0"
        }),
        role: number({
            required_error: "Role is required"
        })
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords do not match",
        path: ["passwordConfirmation"]
    })
})