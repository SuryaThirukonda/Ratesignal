import express from "express";
import { createMaturitySchema, getMaturitySchema,createMaturitySchemaBatch } from "../schema.js";
import {prisma} from "../db.js";

const router = express.Router();

/**
 * @swagger
 * /api/maturities:
 *  get:
 *    tags: [Maturities]
 *    security:
 *      - bearerAuth : []
 *    summary: root
 *    parameters: 
 *      - in query:
 *        name: maturity
 *        required: true
 *        schema: 
 *          type: string
 *          enum: [0Y1M, 0Y3M, 0Y6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y]
 *        example: 1Y
 *      - in query:
 *        name: dateMin
 *        required: true
 *        schema:
 *          type: string
 *          format: date
 *        example: 2025-01-01
 *      - in query:
 *        name: dateMax
 *        required: true
 *        schema:
 *          type: string
 *          format: date
 *        example: 2025-02-01
 *      - in query: 
 *        name: sortByDate
 *        required: false
 *        schema:
 *          type: string
 *          enum: [asc,desc]
 *          default: asc
 *    responses:
 *      200:
 *        description: Yield records returned
 *      401:
 *        description: Authentication required
 *      404: 
 *        description: Nothing found
 * 
 * 
 */
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

/**
 * @swagger
 * /api/maturities/batch:
 *  post:
 *    tags: [Maturities]
 *    security:
 *      - bearerAuth: []
 *    summary: post maturities in batches
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: [items]
 *            properties:
 *              items:
 *                type: array
 *                items:
 *                  type: object
 *                  required: [maturity, date, value]
 *                  properties:
 *                    maturity: { type: string, enum: [0Y1M, 0Y3M, 0Y6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y] }
 *                    date: { type: string, format: date }
 *                    value: { type: number }
 *    responses:
 *      201: { description: Batch insert result }
 *      400: { description: Invalid input }
 *      401: { description: Authentication required }
 *      500: { description: Internal server error }
 */
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

/**
 * @swagger
 * /api/maturities:
 *   post:
 *     tags: [Maturities]
 *     summary: Create one maturity yield record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [maturity, date, value]
 *             properties:
 *               maturity: { type: string, enum: [0Y1M, 0Y3M, 0Y6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y] }
 *               date: { type: string, format: date }
 *               value: { type: number }
 *     responses:
 *       201: { description: Maturity record created }
 *       400: { description: Invalid input }
 *       401: { description: Authentication required }
 *       500: { description: Internal server error }
 */
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
