import express from "express";
import cors from "cors";
import {z} from "zod";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import "dotenv/config";


import PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const { PrismaClient } = PrismaPkg;
const adapter = new PrismaPg({
  connectionString: process.env.NEON_CONNECTION_STRING,
});
const prisma = new PrismaClient({ adapter });

//everything above required for each router

import { createUserSchema,loginUserSchema } from ".././schema.js"

const router = express.Router();




//auth register
router.post("/register", async (req,res,next) => {
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

//auth login, give a jwt
router.post("/login", async (req,res,next) => {
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
        let password = body.password;
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
            return res.status(401).json({error: "Invalid username/email or password"})
        }

        password = await argon2.verify(user.hashedPassword, password);
        if (!password){
            return res.status(401).json({error: "Invalid username/email or password"})
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


//auth verify a jwt
router.post("/me", async (req,res,next) => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({error: "Unauthorized"});
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId){
            return res.status(401).json({error: "unauthenticated"});
        } 

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

export default router;