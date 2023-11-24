import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AppError from "../../../utils/exceptions/AppError";
import {
    createUserI,
    createdUserI,
    userI,
} from "../../models/interfaces/local.interface";
import { Email } from "../../../utils/emails/send.email";
import { correctPassword } from "../../models/hooks/user.hooks";

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
                socialId: null,
            },
        });
        console.log(url);

        const verificationUrl = `${url}/api/v1/auth/verify/?token=${verifyToken}`;
        await new Email(createdUser).sendVerificationToken(
            createdUser.firstName,
            verificationUrl,
        );

        return createdUser;
    }
};

const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user || !(await correctPassword(password, user.password))) {
        throw new AppError("Incorrect login or password", 401);
    } else if (!user.verified) {
        throw new AppError("Verify your account", 401);
    } else {
        return user;
    }
};

const me = async (id: number): Promise<userI> => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
        },
    });
    if (!user) {
        throw new AppError("User not found", 404);
    } else {
        return user;
    }
};

const verify = async (token: string) => {
    const user = await prisma.user.findFirst({
        where: { verifyToken: token },
    });

    if (!user || user.verifyTokenExpires < new Date()) {
        return new AppError(`Token expired`, 401);
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            verified: true,
        },
    });

    return updatedUser;
};

export default { signup, login, me, verify };
