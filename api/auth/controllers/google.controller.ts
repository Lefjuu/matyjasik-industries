import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import jwtUtils from "../../../utils/jwt/jwt.util";
import redisUtils from "../../../utils/jwt/auth.redis";
import AppError from "../../../utils/exceptions/AppError";

const index = function (req: Request, res: Response, next: NextFunction) {
    console.log("here");

    passport.authenticate("google")(req, res, next);
};

const callback = function (req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google", async function (err: Error, user: User) {
        try {
            if (err) {
                throw new AppError("Authorization failed", 500);
            }

            if (!user) {
                return res.status(401).json({ error: "User not found." });
            }

            const refreshToken = await jwtUtils.generateRefreshToken(user.id);
            const accessToken = await redisUtils.generateSessionToken(
                user.id,
                user.role,
            );

            // return res.redirect(
            //     `${process.env.CLIENT_HOSTNAME}/login?accesstoken=${accessToken}&refreshtoken=${refreshToken}`,
            // );
            return res.status(200).json({ refreshToken, accessToken });
        } catch (error) {
            throw new AppError("Internal server error", 500);
        }
    })(req, res, next);
};

export default { index, callback };
