import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AppError from "../../../utils/exceptions/AppError";
import {
    createUserI,
    createdUserI,
} from "../../models/interfaces/local.interface";

const prisma = new PrismaClient();

const signup = async (
    newUser: createUserI,
    url: string,
): Promise<createdUserI> => {
    const exists = await prisma.user.findUnique({
        where: { email: newUser.email },
    });
    if (exists) {
        throw new AppError("Email is already registered", 400);
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
        console.log(url);

        //TODO: Send verification email logic goes here

        return createdUser;
    }
};

export default { signup };
