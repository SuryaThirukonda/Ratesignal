import express from "express";
import cors from "cors";
// import { query }   from "./db.js";
import {z} from "zod";
import argon2 from "argon2";
import jwt from "jsonwebtoken";


import "dotenv/config";
import PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


//routes
import userRouter from "./routes/users.routes.js";
import maturityRouter from "./routes/maturities.routes.js";
import predictionRouter from "./routes/predictions.routes.js";


const { PrismaClient } = PrismaPkg;

import { createUserSchema,loginUserSchema } from "./schema.js"

const port = process.env.PORT || 8000;

const app = express();


//change for deployment
app.use(cors({
    origin: "http://localhost:3000"
}));
app.use(express.json());

//routes
app.use("/api/auth", userRouter);
app.use("/api/maturities", maturityRouter);
app.use("/api/predictions", predictionRouter);

const adapter = new PrismaPg({
  connectionString: process.env.NEON_CONNECTION_STRING,
});

const prisma = new PrismaClient({ adapter });


app.listen(port, () => 
    console.log(`Server is running on port ${port}`)
);



app.get("/", async (req, res) => {
    res.send({"status": "ok"});
});



app.use((err,req,res,next)=> {
    console.error(err);

    if (err instanceof z.ZodError){
        return res.status(400).json({
            error: "validation error",
            details: err.issues
        })
    }

    res.status(500).json({error: "internal server error"})

});