import { Request, Response } from "express";
import AppError from "../../../utils/exceptions/AppError";
import CatchError from "../../../utils/exceptions/CatchError";
import {
    createUserI,
    decodedUserI,
    loginResponseI,
    signupResponseI,
    userI,
} from "../../models/interfaces/local.interface";
import { localService, userService } from "../services";
import jwtUtils from "../../../utils/jwt/jwt.util";
import redisUtils from "../../../utils/jwt/auth.redis";
import { decodedJwtTokenI } from "../../models/interfaces/token.interface";

export interface CustomRequest extends Request {
    decodedUser?: decodedUserI;
}

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

    static me = CatchError(async (req: CustomRequest, res: Response<userI>) => {
        if (req.decodedUser && req.decodedUser.id) {
            const id = req.decodedUser.id;

            const data = await localService.me(parseInt(id));
            if (data instanceof AppError) {
                throw new AppError(data.message, data.statusCode);
            }

            res.status(200).json({ ...data });
        } else {
            throw new AppError("Please provide a valid user ID!", 400);
        }
    });

    static verify = CatchError(async (req: Request, res: Response) => {
        const { token } = req.query;

        if (!token) {
            throw new AppError("Please provide a token!", 400);
        }

        const data = await localService.verify(token.toString());
        if (data instanceof AppError) {
            throw new AppError(data.message, data.statusCode);
        }

        res.status(200).json({ ...data });
    });

    static refresh = CatchError(async (req: Request, res: Response) => {
        const refreshToken: string | string[] | undefined =
            req.body.refreshToken;

        if (typeof refreshToken !== "string") {
            throw new AppError("Invalid or missing Refresh token.", 401);
        }

        const decoded: decodedJwtTokenI =
            await jwtUtils.decodeRefreshToken(refreshToken);
        console.log(decoded);

        const user = await userService.getUser(decoded.userId);
        if (!user) {
            throw new AppError(
                "The user belonging to this token does no longer exist.",
                401,
            );
        }

        const newRefreshToken = await jwtUtils.generateRefreshToken(user.id);
        const accessToken = await redisUtils.generateSessionToken(
            user.id,
            user.role,
        );

        res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    });
}

export default LocalController;
