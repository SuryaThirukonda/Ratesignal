import express from "express";
import cors from "cors";
// import { query }   from "./db.js";
import {z} from "zod";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {prisma} from "./db.js"

//routes
import userRouter from "./routes/users.routes.js";
import maturityRouter from "./routes/maturities.routes.js";
import predictionRouter from "./routes/predictions.routes.js";

//middleware
import {requireAuth,authlimit,dataLimit} from "./middleware.js";

const port = process.env.PORT || 8000;
const app = express();

if (!process.env.NEON_CONNECTION_STRING || !process.env.JWT_SECRET){
    throw new Error("environment variables not set");
}

//change for deployment
app.use(cors({
    origin: "http://localhost:3000"
}));
app.use(express.json());

//routes
app.use("/api/auth", authlimit, userRouter);
app.use("/api/maturities", dataLimit, requireAuth, maturityRouter);
app.use("/api/predictions", dataLimit, requireAuth,predictionRouter);


app.listen(port, () => 
    console.log(`Server is running on port ${port}`)
);

app.get("/", async (req, res) => {
    res.send({"status": "ok"});
});

app.use((err,req,res,next) => {
    console.error(err);

    if (err instanceof z.ZodError){
        return res.status(400).json({
            error: "validation error",
            details: err.issues
        });
    }

    res.status(500).json({error: "internal server error"});

});