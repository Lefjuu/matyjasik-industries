import { app, init } from "./app";
import dotenv from "dotenv";

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverInstance: any = null;

process.on("uncaughtException", (err: Error) => {
    console.log("UNCAUGHT EXCEPTION! Shutting down...");
    console.error(err.name, err.message);
    if (serverInstance) {
        serverInstance.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

(async () => {
    try {
        await init();

        serverInstance = app.listen(process.env.SERVER_PORT, () => {
            console.log(
                `✔️  Server is ready.
                \nmode: ${process.env.NODE_ENV}
                \nserver: http://${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}`,
            );
        });
    } catch (err) {
        console.error(err);
    }
})();

process.on("unhandledRejection", (err: Error) => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.error(err.name, err.message);
    if (serverInstance) {
        serverInstance.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

process.on("SIGTERM", () => {
    console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
    if (serverInstance) {
        serverInstance.close(() => {
            console.log("💥 Process terminated!");
        });
    } else {
        process.exit(1);
    }
});
