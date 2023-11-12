import helmet from "helmet";
import { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { json } from "body-parser";
import localRouter from "../api/auth/routes/local.router";
import googleRouter from "../api/auth/routes/google.router";
import AppError from "../utils/exceptions/AppError";
import globalErrorHandler from "../utils/exceptions/Handler";
import passport from "passport";
import session, { SessionOptions } from "express-session";

require("../api/auth/passport/google.passport");

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
        // origin: process.env.CLIENT_HOSTNAME || "",
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

    app.use(
        session({
            secret: process.env.GOOGLE_SESSION || "",
            resave: false,
            saveUninitialized: true,
        } as SessionOptions),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(cors(corsOptions));

    if (process.env.NODE_ENV === "development") {
        app.use(morgan("dev"));
    }

    app.use("/api/v1/auth", localRouter);
    app.use("/api/v1/auth", googleRouter);
    app.all("*", (req: Request, res: Response, next: NextFunction) => {
        next(
            new AppError(`Can't find ${req.originalUrl} on this server!`, 404),
        );
    });
    app.use(globalErrorHandler);
};

export { create };
