import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AppError from "../../../utils/exceptions/AppError";
import { createUserI } from "../../models/interfaces/user.interface";

const prisma = new PrismaClient();

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    verifyToken: string;
    verifyTokenExpires: Date;
    verified: boolean;
}

export const signup = async (
    newUser: createUserI,
    url: string,
): Promise<User | AppError> => {
    const exists = await prisma.user.findUnique({
        where: { email: newUser.email },
    });
    if (exists) {
        return new AppError("Email is already registered", 400);
    } else {
        const activationToken = crypto.randomBytes(32).toString("hex");
        const verifyToken = crypto
            .createHash("sha256")
            .update(activationToken)
            .digest("hex");
        const expirationTime = new Date();
        expirationTime.setDate(expirationTime.getDate() + 1);

        const hashedPassword = await bcrypt.hash(newUser.password, 12);

        const createdUser = await prisma.user.create({
            data: {
                ...newUser,
                password: hashedPassword,
                verifyToken: verifyToken,
                verifyTokenExpires: expirationTime,
            },
        });
        console.log(createdUser);
        console.log(url);

        //TODO: Send verification email logic goes here

        console.log(newUser);

        return createdUser;
        // return createdUser;
    }
};
