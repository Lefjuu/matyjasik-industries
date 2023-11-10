import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { createUserI, updateUserI } from "../interfaces/local.interface";

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
