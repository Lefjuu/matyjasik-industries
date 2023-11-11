import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/exceptions/AppError";
import redisUtils from "../../../utils/jwt/auth.redis";

export const mw =
    (required: string[] = []) =>
    async (req: Request, res: Response, next: NextFunction) => {
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

            const decoded = await redisUtils.check(tokenParts[1]);

            if (decoded && required.length > 0 && "ROLE" in decoded) {
                const isAuthorized = required.some((role) =>
                    decoded.role.includes(role),
                );
                if (!isAuthorized) {
                    throw new AppError("You are not authorized", 401);
                }
            }
            if (decoded) {
                await redisUtils.renew(decoded.key);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (req as any).user = decoded;
                next();
            } else {
                throw new AppError("You are not authorized", 401);
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw new AppError(error.message, error.statusCode);
            } else {
                console.error(error);
                return res.status(403).json({ msg: "Token expired in redis" });
            }
        }
    };
