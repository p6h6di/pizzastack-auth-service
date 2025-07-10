import "reflect-metadata";
import path from "path";
import express, { Response, Request, NextFunction } from "express";
import cookieParser from "cookie-parser";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";

const app = express();

app.use(
    "/",
    express.static(path.join(__dirname, "public"), {
        dotfiles: "allow",
        index: false,
    })
);

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRouter);

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.status || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                message: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
