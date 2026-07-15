import express from "express";
import "dotenv/config";
import PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createMaturitySchema, getMaturitySchema,createMaturitySchemaBatch } from "../schema.js";
const { PrismaClient } = PrismaPkg;
const adapter = new PrismaPg({
  connectionString: process.env.NEON_CONNECTION_STRING,
});
const prisma = new PrismaClient({ adapter });

const router = express.Router();



router.get("/", async (req,res,next)=> {
    try{
        const body = getMaturitySchema.parse(req.query);

        const maturity = body.maturity;
        const dateMin = body.dateMin;
        const dateMax = body.dateMax;
        const order = body.sortByDate;

        const mat = await prisma.yield.findMany({
            where: {
                date: {
                    gte: dateMin,
                    lte: dateMax
                },
                maturity: {
                    in : maturity
                }
            },
            select: {
                maturity: true, 
                date: true,
                value: true
            },
            orderBy: {
                date: order
            }
        });
        

        if (mat.length ==0 ){
            return res.status(404).json({error: "mat not found"});
        }

        return res.status(200).json(mat);


    }catch(err){
        next(err);
    }

});

router.post("/batch/", async (req,res,next)=>{
    try{
        
        const result = createMaturitySchemaBatch.safeParse(req.body);

        if (!result.success){
            return res.status(400).json({error: "Invalid input", issues: result.error.issues});
        }

        const rows = result.data.items;

        const maturities = await prisma.yield.createMany({
            data: rows,
            skipDuplicates: true

        });

        return res.status(201).json({
            inserted: maturities.count,
            recieved: rows.length
        });
    }catch(err){
        next(err);
    }

});

router.post("/", async (req,res,next)=>{
    try{
        const body = createMaturitySchema.parse(req.body);

        const mat = await prisma.yield.create({
            data: body,
            select : {
                maturity: true, 
                date: true,
                value: true
            }
        });

        return res.status(201).json(mat);



    }catch(err){
        next(err);
    }

});


export default router;
