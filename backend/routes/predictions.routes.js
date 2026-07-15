import express from "express";
import "dotenv/config";
import PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createPredictionSchema, getPredictionSchema, createPredictionSchemaBatch } from "../schema.js";
import { es } from "zod/v4/locales";
const { PrismaClient } = PrismaPkg;
const adapter = new PrismaPg({
  connectionString: process.env.NEON_CONNECTION_STRING,
});
const prisma = new PrismaClient({ adapter });

//everything above required for each router

const isValidMaturity = function(maturity){
    const matList = ["0Y1M", "0Y3M", "0Y6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"]
    if (typeof maturity == "string"){
        if (matList.includes(maturity)){
            return true;
        }
        return false;
    }
    for (const mat of maturity){
        if (!matList.includes(mat)){
            return false;
        }
    }
    
    return true;
};

const isValidModel = function(model){
    const modelsList= ["ar", "var", "arXgboost", "varXgboostMat", "varXgboostDns", "arDns", "varDns"]
    if (typeof model == "string"){
        if (modelsList.includes(model)){
            return true;
        }
    }
    for (const models of model){
        if (!modelsList.includes(models)){
            return false;
        }
    }
    return true;
}

const isValidHorizon = function(horizons){
    const list = [1,5,20]
    if (typeof horizons == "int"){
        if (list.includes(horizons)){
            return true;
        }
    }
    for (const horizon of horizons){
        if (!list.includes(horizon)){
            return false;
        }
    }
    return true;
}


const parseDate = (value) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};


const router = express.Router();



router.get("/", async (req,res,next)=> {
    try{
        const body = getPredictionSchema.parse(req.query);

        //Data validation
        let maturity = body.maturity;
        if (!isValidMaturity(maturity)){
            return res.status(400).json({error: "Invalid Maturity"});
        }

        const asOfDate = parseDate(body.asOfDate);
        if (!asOfDate){
            return res.status(400).json({
                error: "Invalid asOfDate"
            })
        }

        const predictedDateMin = parseDate(body.predictedDateMin);
        const predictedDateMax = parseDate(body.predictedDateMax);
        if (!predictedDateMin || !predictedDateMax){
            return res.status(400).json({error: "Invalid prediction date"});
        }

        const sortBy = body.sortByDate;
        if (sortBy !="asc" && sortBy != "desc"){
            return res.status(400).json({error: "Invalid sort"});
        }

        const model = body.modelType;
        if (!isValidModel(model)){
            return res.status(400).json({error: "invalid model(s) provided"});
        }

        const horizon = body.horizon;
        if(!isValidHorizon(horizon)){
            return res.status(400).json({error: "invalid horizon(s) provided"})
        }

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
        
        const rows = result.data.items.map((item) => ({
            asOfDate: new Date(item.asOfDate),
            maturity: item.maturity,
            predictedDate: new Date(item.predictedDate),
            value: item.value,
            modelType: item.modelType,
            horizon: item.horizon
        }));

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

        const maturity = body.maturity;
        const asOfDate = parseDate(body.asOfDate);
        const predictedDate = parseDate(body.predictedDate);
        const value = body.value;
        const horizon = body.horizon;
        const model = body.modelType;

        if (!isValidMaturity(maturity)){
            return res.status(400).json({error: "Invalid Maturity"});
        }

        if (!asOfDate){
            return res.status(400).json({
                error: "Invalid asOfDate"
            })
        }

        if (!predictedDate){
            return res.status(400).json({error: "Invalid prediction date"});
        }

        if (!isValidModel(model)){
            return res.status(400).json({error: "invalid model provided"});
        }

        if(!isValidHorizon(horizon)){
            return res.status(400).json({error: "invalid horizon provided"})
        }

        if (typeof value != "number"){
            return res.status(400).json({error: "invalid value provided"})
        }

        const prediction = await prisma.prediction.create({
            data:{
                maturity: maturity,
                asOfDate: asOfDate,
                predictedDate: predictedDate,
                value: value,
                horizon: horizon,
                modelType: model
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

        return res.status(201).json(prediction);        

    }catch(err){
        next(err);
    }

});


export default router;
sc