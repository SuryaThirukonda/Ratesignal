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


const router = express.Router();


router.get("/", async (req,res,next)=> {
    res.json({"message":"prediction_route"});

});

export default router;