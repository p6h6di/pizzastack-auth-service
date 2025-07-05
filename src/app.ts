import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello, Pizza Stack!");
});

export default app;
