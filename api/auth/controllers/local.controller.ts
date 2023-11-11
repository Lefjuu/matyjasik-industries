import { Request, Response } from "express";
import AppError from "../../../utils/exceptions/AppError";
import CatchError from "../../../utils/exceptions/CatchError";
import {
    createUserI,
    loginResponseI,
    signupResponseI,
} from "../../models/interfaces/local.interface";
import { localService } from "../services";
import jwtUtils from "../../../utils/jwt/jwt.util";
import redisUtils from "../../../utils/jwt/auth.redis";

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

            const url = `${req.protocol}://${req.get("host")}`;

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

    static login = CatchError(
        async (req: Request, res: Response<loginResponseI>) => {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new AppError("Please provide email and password!", 400);
            }

            const data = await localService.login(email, password);
            if (data instanceof AppError) {
                throw new AppError(data.message, data.statusCode);
            }

            const refreshToken = await jwtUtils.generateRefreshToken(data.id);
            const accessToken = await redisUtils.generateSessionToken(
                data.id,
                data.role,
            );

            res.status(200).json({
                accessToken,
                refreshToken,
                data: {
                    id: data.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                },
            });
        },
    );
}

export default LocalController;
