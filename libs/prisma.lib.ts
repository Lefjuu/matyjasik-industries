import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log("✔️  Postgres connected");
    } catch (error) {
        console.error("❌ Postgres error:", error);
    } finally {
        await prisma.$disconnect();
    }
}
