import express, { Express } from "express";
import { create } from "./libs/express.lib";
import { checkDatabaseConnection } from "./libs/prisma.lib";
import { connect } from "./libs/redis.lib";

const app: Express = express();

const init = async (): Promise<void> => {
    // express
    await create(app);

    // postgresql
    await checkDatabaseConnection();

    // redis
    await connect();
};

export { init, app };
