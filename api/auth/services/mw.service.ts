import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/exceptions/AppError";
import redisUtils from "../../../utils/jwt/auth.redis";
import { decodedUserI } from "../../models/interfaces/local.interface";
import { decodedJwtTokenI } from "../../models/interfaces/token.interface";

interface CustomRequest extends Request {
    decodedUser?: decodedUserI;
}

export const mw =
    (required: string[] = []) =>
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;

            if (!token) {
                return next(
                    new AppError(
                        "You are not logged in! Please log in to get access.",
                        401,
                    ),
                );
            }

            const tokenParts = token.split(" ");

            if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
                return next(new AppError("Invalid token format", 400));
            }

            const decoded: decodedJwtTokenI | null = await redisUtils.check(
                tokenParts[1],
            );

            console.log(decoded);

            if (!decoded) {
                throw new AppError("You are not authorized", 401);
            }
            if (required.length > 0 && decoded.role) {
                const isAuthorized = required.some((role) =>
                    decoded.role.includes(role),
                );
                if (!isAuthorized) {
                    throw new AppError("You are not authorized", 401);
                }
            }

            await redisUtils.renew(decoded.key);

            req.decodedUser = decoded;

            next();
        } catch (error) {
            if (error instanceof AppError) {
                console.log("here");

                next(new AppError(error.message, error.statusCode));
            } else {
                console.error(error);
                return res.status(403).json({ msg: "Token expired in redis" });
            }
        }
    };
