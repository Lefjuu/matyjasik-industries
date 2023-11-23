import { PrismaClient, Provider } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
    createUserI,
    createdUserI,
    updateUserI,
} from "../interfaces/local.interface";
import { SocialProfileI } from "../interfaces/google.interface";

const prisma = new PrismaClient();

export const beforeCreate = async (userData: createUserI) => {
    const activationToken = crypto.randomBytes(32).toString("hex");
    const verifyToken = crypto
        .createHash("sha256")
        .update(activationToken)
        .digest("hex");
    const expirationTime = new Date();
    expirationTime.setDate(expirationTime.getDate() + 1);

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const newUser = await prisma.user.create({
        data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: hashedPassword,
            verifyToken: verifyToken,
            verifyTokenExpires: expirationTime,
            socialId: null,
        },
    });

    return newUser;
};

export const beforeUpdate = async (userData: updateUserI) => {
    if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userData.id,
        },
        data: userData,
    });

    return updatedUser;
};

export const correctPassword = async (
    candidatePassword: string,
    password: string,
) => {
    return await bcrypt.compare(candidatePassword, password);
};

export const loginByGoogle = async (
    profile: SocialProfileI,
): Promise<createdUserI> => {
    try {
        let user = await prisma.user.findUnique({
            where: {
                socialId: profile.id,
                email: profile.email,
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    provider: profile.provider.toUpperCase() as Provider,
                    email: profile.email,
                    socialId: profile.id,
                    password: "",
                    firstName: "",
                    lastName: "",
                    verifyToken: "",
                    verifyTokenExpires: new Date(),
                    verified: true,
                },
            });
        }

        return user;
    } catch (error) {
        console.error("Error in loginBySocial:", error);
        throw new Error("Social login failed");
    }
};
