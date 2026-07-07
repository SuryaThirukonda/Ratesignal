import express from "express";
import cors from "cors";
import { query }   from "./db.js";
import {z} from "zod";
import argon2 from "argon2";

import "dotenv/config";
import PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = PrismaPkg;

import { createUserSchema } from "./schema.js"

const port = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json());

const adapter = new PrismaPg({
  connectionString: process.env.NEON_CONNECTION_STRING,
});

const prisma = new PrismaClient({ adapter });


app.listen(port, () => console.log(`Server is running on port ${port}`));



app.get("/", async (req, res) => {
    res.send({"status": "ok"});
});

app.post("/api/user", async (req,res,next) => {
    //user table -> id,name, email, hashed_password, created_at, updated_at, email_verified

    try{
        //validate input
        const body = createUserSchema.parse(req.body);

        const hashedPassword = await argon2.hash(body.password);

        const user = await prisma.user.create({
            data: {
                name: body.name,
                username: body.username,
                email: body.email,
                hashedPassword
            },
            select: {
                id: true,
                name: true,
                username: true,
                createdAt: true
            }
        });
        //select returns user without the generated password

        res.status(201).json(user)
    }catch(err){
        next(err);
    }

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