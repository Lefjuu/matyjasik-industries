import { PrismaClient } from "@prisma/client";
import AppError from "../../../utils/exceptions/AppError";
import { userI } from "../../models/interfaces/local.interface";

const prisma = new PrismaClient();

const getUser = async (id: number): Promise<userI> => {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new AppError("User not found", 404);
    } else {
        return user;
    }
};

export default { getUser };
