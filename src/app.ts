import express, { Response, Request, NextFunction } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello, Pizza Stack!");
});

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
