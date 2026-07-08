import express from "express";
import cors from "cors";
import { query }   from "./db.js";
import {z} from "zod";
import argon2 from "argon2";
import jwt from "jsonwebtoken";


import "dotenv/config";
import PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = PrismaPkg;

import { createUserSchema,loginUserSchema } from "./schema.js"

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

app.post("/api/auth/register", async (req,res,next) => {
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

app.post("/api/auth/login", async (req,res,next) => {
    try{
        const body = loginUserSchema.parse(req.body);
        let username;
        let email;
        if (body.identifier.includes("@")){
            email = body.identifier;
        } else {
            username = body.identifier;
        }
        if (!username && !email){
            return res.status(400).json({error: "Email or username is required"})
        }
        const password = body.password;
        let user;
        if (username){
            user = await prisma.user.findUnique({
                where: {
                    username : username, 
                }
            });
        }
        else{
            user = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })
        }
        if (!user){
            return res.status(400).json({error: "Invalid username/email or password"})
        }

        const password = await argon2.verify(user.hashedPassword, password);
        if (!password){
            return res.status(400).json({error: "Invalid username/email or password"})
        }


        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.json({
            "user" :{
                "id": user.id,
                "name": user.name,
                "username": user.username,
            },
            "token": token

        });

    }catch(err){
        next(err);
    }
});

app.post("/api/auth/me", async (req,res,next) => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({error: "Unauthorized"});
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        });

        if (!user){
            return res.status(401).json({error: "Unauthorized"});
        }

        res.json({
            "user" :{
                "id": user.id,
                "name": user.name,
                "username": user.username,
            }
        });

        return res.status(200).json({message: "User authenticated", user: user});


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