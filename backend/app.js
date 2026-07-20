import express from "express";
import cors from "cors";
// import { query }   from "./db.js";
import {z} from "zod";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import "dotenv/config";
import {prisma} from "./db.js"

//swagger
import swaggerUI from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

//dont use zod-to-openapi, openapi descriptions are wrote manually
//import { openApiDocument } from "./openapi/document.js";

//routes
import userRouter from "./routes/users.routes.js";
import maturityRouter from "./routes/maturities.routes.js";
import predictionRouter from "./routes/predictions.routes.js";

//middleware
import {authlimit,dataLimit} from "./middleware.js";


const port = process.env.PORT || 9000;
const app = express();

if (!process.env.NEON_CONNECTION_STRING || !process.env.JWT_SECRET){
    throw new Error("environment variables not set");
}

//change for deployment
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

//routes
app.use("/api/auth", authlimit, userRouter);
app.use("/api/maturities", dataLimit, maturityRouter);
app.use("/api/predictions", dataLimit,predictionRouter);

//swagger

const swaggerSettings = {
    definition: {
        openapi: '3.0.0',
        info: { title: "Ratesignal express API", version: '1.0.0'},
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ['./routes/*.routes.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerSettings);
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


// app.use("/api/docs",swaggerUi.serve, swaggerUi.setup(openApiDocument));


app.get("/", async (req, res) => {
    res.send({"status": "ok"});
});

app.use((err,req,res,next) => {
    console.error(err);

    if (err instanceof z.ZodError){
        return res.status(400).json({
            error: "validation error",
            details: err.issues
        });
    }

    res.status(500).json({error: "internal server error"});

});

app.listen(port, () =>
    console.log(`Server is running on port ${port}`)
);
