import { Request, Response } from "express";
import AppError from "../../../utils/exceptions/AppError";
import { createUserI } from "../../models/interfaces/user.interface";
import { signup } from "../services/local.service";
import CatchError from "../../../utils/exceptions/CatchError";

export class AuthController {
    static signup = CatchError(async (req: Request, res: Response) => {
        const { email, firstName, lastName, password } = req.body;

        if (!email || !firstName || !lastName || !password) {
            throw new AppError(
                "Please provide email, first name, last name, and password!",
                400,
            );
        }

        const newUser: createUserI = {
            email,
            firstName,
            lastName,
            password,
        };

        const url = `${req.protocol}://${req.get("host")}/api/v1/auth/verify/`;

        const data = await signup(newUser, url);
        if (data instanceof AppError) {
            console.log(data);
            throw new AppError(data.message, data.statusCode);
        }

        res.status(201).json({
            status: "success",
            message: "Verification account email sent",
            data: {
                user: data,
            },
        });
    });
}

export default AuthController;
