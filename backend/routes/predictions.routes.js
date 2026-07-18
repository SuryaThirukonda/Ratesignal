import express from "express";
import {prisma} from "../db.js";
import { createPredictionSchema, getPredictionSchema, createPredictionSchemaBatch } from "../schema.js";

const router = express.Router();

/**
 * @swagger
 * /api/predictions:
 *   get:
 *     tags: [Predictions]
 *     summary: Retrieve predictions matching the requested filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: maturity, required: true, schema: { type: string, enum: [0Y1M, 0Y3M, 0Y6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y] } }
 *       - { in: query, name: asOfDate, required: true, schema: { type: string, format: date } }
 *       - { in: query, name: predictedDateMin, required: true, schema: { type: string, format: date } }
 *       - { in: query, name: predictedDateMax, required: true, schema: { type: string, format: date } }
 *       - { in: query, name: sortByDate, required: true, schema: { type: string, enum: [asc, desc] } }
 *       - { in: query, name: modelType, required: true, schema: { type: string, enum: [ar, var, arXgboost, varXgboostMat, varXgboostDns, arDns, varDns] } }
 *       - { in: query, name: horizon, required: true, schema: { type: integer, enum: [1, 5, 20] } }
 *     responses:
 *       200: { description: Prediction records returned }
 *       400: { description: Invalid filters }
 *       401: { description: Authentication required }
 *       404: { description: No matching predictions found }
 *       500: { description: Internal server error }
 */
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

/**
 * @swagger
 * /api/predictions/batch:
 *   post:
 *     tags: [Predictions]
 *     summary: Create prediction records in a batch
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [maturity, asOfDate, predictedDate, value, modelType, horizon]
 *                   properties:
 *                     maturity: { type: string, enum: [0Y1M, 0Y3M, 0Y6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y] }
 *                     asOfDate: { type: string, format: date }
 *                     predictedDate: { type: string, format: date }
 *                     value: { type: number }
 *                     modelType: { type: string, enum: [ar, var, arXgboost, varXgboostMat, varXgboostDns, arDns, varDns] }
 *                     horizon: { type: integer, enum: [1, 5, 20] }
 *     responses:
 *       201: { description: Batch insert result }
 *       400: { description: Invalid input }
 *       401: { description: Authentication required }
 *       500: { description: Internal server error }
 */
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

/**
 * @swagger
 * /api/predictions:
 *   post:
 *     tags: [Predictions]
 *     summary: Create one prediction record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [maturity, asOfDate, predictedDate, value, modelType, horizon]
 *             properties:
 *               maturity: { type: string, enum: [0Y1M, 0Y3M, 0Y6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y] }
 *               asOfDate: { type: string, format: date }
 *               predictedDate: { type: string, format: date }
 *               value: { type: number }
 *               modelType: { type: string, enum: [ar, var, arXgboost, varXgboostMat, varXgboostDns, arDns, varDns] }
 *               horizon: { type: integer, enum: [1, 5, 20] }
 *     responses:
 *       201: { description: Prediction record created }
 *       400: { description: Invalid input }
 *       401: { description: Authentication required }
 *       500: { description: Internal server error }
 */
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
