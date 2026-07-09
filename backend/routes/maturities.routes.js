import express from "express";
import "dotenv/config";
import PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createMaturitySchema, getMaturitySchema,createMaturitySchemaBatch } from "../schema.js";
import { _isoDateTime } from "zod/v4/core";
const { PrismaClient } = PrismaPkg;
const adapter = new PrismaPg({
  connectionString: process.env.NEON_CONNECTION_STRING,
});
const prisma = new PrismaClient({ adapter });

//everything above required for each router

const isValidMaturity = function(maturity){
    const matList = ["0Y1M", "0Y3M", "0Y6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"]
    if (matList.includes(maturity)){
        return true;
    } 
    return false;
};

const parseDate = (value) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};


const router = express.Router();



router.get("/", async (req,res,next)=> {
    try{
        const body = getMaturitySchema.parse(req.query);

        const maturity = body.maturity;
        const date = parseDate(body.date);

        if (!isValidMaturity(maturity)){
            return res.status(400).json({error: "Invalid Maturity"});
        }

        if (!date){
            return res.status(400).json({error: "Invalid date"});
        }

        const mat = await prisma.yield.findUnique({
            where: {
                date_maturity: {
                    date,
                    maturity: maturity
                },
            },
            select: {
                maturity: true, 
                date: true,
                value: true
            }
        });

        if (!mat){
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

        const rows = result.data.items.map((item) => ({
            date: new Date(item.date),
            maturity: item.maturity,
            value: item.value
        }));

        const maturities = await prisma.yield.createMany({
            data: rows,
            skipDuplicates: true

        });

        return res.status(201).json({
            inserted: maturities.count,
            recieved: rows.length
        })
    }catch(err){
        next(err);
    }

});

router.post("/", async (req,res,next)=>{
    try{
        const body = createMaturitySchema.parse(req.body);

        const maturity = body.maturity;
        const date = parseDate(body.date);
        const value = body.value;

        if (!isValidMaturity(maturity)){
            return res.status(400).json({error: "Invalid Maturity"});
        }

        if (!date){
            return res.status(400).json({error: "Invalid date"});
        }

        const mat = await prisma.yield.create({
            data: {
                maturity: maturity,
                value: value, 
                date: date
            },
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
