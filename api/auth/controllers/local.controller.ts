import { Request, Response } from "express";
import AppError from "../../../utils/exceptions/AppError";
import CatchError from "../../../utils/exceptions/CatchError";
import {
    createUserI,
    signupResponseI,
} from "../../models/interfaces/local.interface";
import { localService } from "../services";

export class LocalController {
    static signup = CatchError(
        async (req: Request, res: Response<signupResponseI>) => {
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

            const url = `${req.protocol}://${req.get(
                "host",
            )}/api/v1/auth/verify/`;

            const data = await localService.signup(newUser, url);
            if (data instanceof AppError) {
                console.log(data);
                throw new AppError(data.message, data.statusCode);
            }

            res.status(201).json({
                message: "Verification account email sent",
            });
        },
    );
}

export default LocalController;
