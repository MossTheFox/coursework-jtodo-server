import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";

// 这里用不到 cookie-parser. 所有验证借助 header 中的 Authorization 字段 (via jsonwebtoken)
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    // ...呃
    res.removeHeader("x-powered-by");

    // debug
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    if (req.body) {
        console.log(JSON.stringify(req.body, null, 2));
    }

    next();
});

// 登入
import authRoute from "./routes/qqAuth";
app.use("/auth", authRoute);

// 用户信息、用户的 Collection
import dataRoute from "./routes/dataRoute";
app.use("/data", dataRoute);

app.get("/", (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send({
        code: "ok",
        message: "JToDo App Backend Server"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send("Not Found");
});

// 500 handler
app.use((err: Error, req: Request, res: Response, next: () => any) => {
    console.log(err);
    res.status(500).send("Internal Server Error");
});



app.listen(process.env.NODE_ENV === "development" ? 3000 : 18000, () => {
    console.log(`[${new Date().toISOString()}] Server started on port ${process.env.NODE_ENV === "development" ? 3000 : 18000}`);
});