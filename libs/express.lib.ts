import helmet from "helmet";
import { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { json } from "body-parser";

const create = async (app: Express): Promise<void> => {
    app.use(helmet());
    app.use(
        json({
            limit: "50mb",
        }),
    );

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());

    const corsOptions: cors.CorsOptions = {
        origin: process.env.CLIENT_HOSTNAME,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Access-Control-Allow-Headers",
        ],
    };

    app.use(cors(corsOptions));

    if (process.env.NODE_ENV === "development") {
        app.use(morgan("dev"));
    }

    // app.use("/api/v1/auth", localRouter);
    // app.use("/api/v1/auth", googleRouter);
    // app.use("/api/v1/auth", githubRouter);
    // app.use("/api/v1/auth", facebookRouter);
    // app.use("/api/v1/users", userRouter);
    // app.use("/api/v1/list", listRouter);
    // app.use("/api/v1/task", taskRouter);
    // app.use("/api/v1/management", managementRouter);

    // app.all("*", (req, res, next) => {
    //     next(
    //         new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
    //     );
    // });
};

export { create };
