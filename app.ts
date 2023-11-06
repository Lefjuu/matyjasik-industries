import express, { Express } from "express";
import { create } from "./libs/express.lib";
// import { db } from "./lib/postgres.lib";
// import { redisClient } from "./lib/redis.lib";
// import { User, Task, List } from "./api/model";
import { checkDatabaseConnection } from "./libs/prisma.lib";

const app: Express = express();

const init = async (): Promise<void> => {
    // express
    await create(app);

    // postgresql
    await checkDatabaseConnection();

    // redis
    // await redisClient.connect();
};

export { init, app };
