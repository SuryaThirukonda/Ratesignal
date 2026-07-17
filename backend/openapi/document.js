import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry.js";


import "./routes.js";

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openApiDocument = generator.generateDocument({
    openapi: '3.1.0',

    info:{
        title: "RateSignal-backend",
        version: "1.0.0",
        descrption: "get historical treasury yield curve data, as well as future forecasts"
    },

    servers: {
        url: "http://localhost9000",
        descrption: "local dev"
    }
})