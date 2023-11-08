import { Request, Response, NextFunction } from "express";
import AppError from "./AppError";

const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
    if (req.originalUrl.startsWith("/api")) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    console.error("ERROR 💥", err);
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: err.message,
    });
};

const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
    if (req.originalUrl.startsWith("/api")) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        console.error("ERROR 💥", err);
        res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }
    if (err.isOperational) {
        return res.status(err.statusCode).render("error", {
            title: "Something went wrong!",
            msg: err.message,
        });
    }
    console.error("ERROR 💥", err);
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: "Please try again later.",
    });
};

const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
): void => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        const error = { ...err };
        error.message = err.message;

        sendErrorProd(error, req, res);
    }
};

export default errorHandler;
