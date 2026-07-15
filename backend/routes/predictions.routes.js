import express from "express";
import {prisma} from "../db.js";
import { createPredictionSchema, getPredictionSchema, createPredictionSchemaBatch } from "../schema.js";

const router = express.Router();

router.get("/", async (req,res,next)=> {
    try{
        const body = getPredictionSchema.parse(req.query);

        const maturity = body.maturity;
        const asOfDate = body.asOfDate;
        const predictedDateMin = body.predictedDateMin;
        const predictedDateMax = body.predictedDateMax;
        const sortBy = body.sortByDate;
        const model = body.modelType;
        const horizon = body.horizon;

        const yields = await prisma.prediction.findMany({
            where: {
                asOfDate: asOfDate, 
                predictedDate: {
                    gte: predictedDateMin,
                    lte: predictedDateMax
                },
                maturity: {
                    in :maturity
                },
                modelType: {
                    in :model
                },
                horizon: {
                    in: horizon
                }
            },
            orderBy: {
                predictedDate: sortBy
            },
            select: {
                maturity: true,
                value: true,
                asOfDate: true,
                predictedDate: true,
                modelType: true,
                horizon: true
            }

        });

        if (yields.length == 0){
            return res.status(404).json({error: "no values found"});
        }

        return res.status(200).json(yields);
        
    }catch(err){
        next(err);
    }

});

router.post("/batch/", async (req,res,next)=>{
    try{
        const result = createPredictionSchemaBatch.safeParse(req.body);
        if (!result.success){
            return res.status(400).json({error: "Invalid input", issues: result.error.issues});
        }
        
        const rows = result.data.items;

        const predictions = await prisma.prediction.createMany({
            data: rows,
            skipDuplicates: true
        });

        return res.status(201).json({
            inserted: predictions.count,
            recieved: rows.length
        });

    }catch(err){
        next(err);
    }

});

router.post("/", async (req,res,next)=>{
    try{
        const body = createPredictionSchema.parse(req.body);

        const prediction = await prisma.prediction.create({
            data: body,
            select: {
                maturity: true,
                value: true,
                asOfDate: true,
                predictedDate: true,
                modelType: true,
                horizon: true
            }

        });

        return res.status(201).json(prediction);        

    }catch(err){
        next(err);
    }

});


export default router;
