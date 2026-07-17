import {z} from "zod";

import {registry} from "./openapi/registry.js";
// User Schemas
export const createUserSchema = z.object({
  name: z.string().min(0),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginUserSchema = z.object({
    identifier : z.string().min(1, "Email or password is required"),
    password: z.string().min(8, "password is required")
});



//maturities schemas

//repurposed schemas
const maturitySchema = z.enum([
  "0Y1M", "0Y3M", "0Y6M",
  "1Y", "2Y", "3Y", "5Y",
  "7Y", "10Y", "20Y", "30Y"
]);

const modelTypeSchema = z.enum([
  "ar",
  "var",
  "arXgboost",
  "varXgboostMat",
  "varXgboostDns",
  "arDns",
  "varDns"
]);

//express query comes as string, validate as string, typecast to number
const horizonSchema = z.preprocess(
  value => typeof value =="string" ? value: String(value),
  z.enum(["1","5","20"])
).transform(value => Number(value));

const sortSchema = z.enum(["asc", "desc"]);

// Validate dates ()
const dateMinMat = "2001-07-31";
const dateMaxMat = "2025-05-14";
const dateSchema = z.iso.date().refine(date=> date<=dateMaxMat && date>=dateMinMat).transform(value=> new Date(value));

export const getMaturitySchema = z.object({
  maturity: z.preprocess(
    value => Array.isArray(value) ? value: [value],
    z.array(maturitySchema).min(1),
  ),
  dateMin: dateSchema,
  dateMax: dateSchema,
  sortByDate: sortSchema.default("asc")
}).refine(
  ({dateMin, dateMax}) => dateMin <= dateMax,
  {
    message: "datemin must be less than datemax",
    path: ["dateMax"],
  }
);

export const createMaturitySchema = z.object({
  maturity: maturitySchema,
  date: dateSchema,
  value: z.float32().min(0).max(20)  ,
});

//batch upload schema
export const createMaturitySchemaBatch = z.object({
  items: z.array(createMaturitySchema).min(1).max(1000)
});


//predictions schemas

const dateMaxPred = "2025-06-03";
const dateSchemaPred = z.iso.date().refine(date=> date<=dateMaxPred && date>=dateMinMat).transform(value => new Date(value));

export const getPredictionSchema = z.object({
  maturity: z.preprocess(
    value => Array.isArray(value) ? value: [value],
    z.array(maturitySchema).min(1)
  ),
  asOfDate: dateSchema,
  predictedDateMin: dateSchemaPred,
  predictedDateMax: dateSchemaPred,
  sortByDate: sortSchema,
  modelType: z.preprocess(
    value => Array.isArray(value) ? value: [value],
    z.array(modelTypeSchema).min(1).max(13)
  ),
  horizon: z.preprocess(value => Array.isArray(value)? value: [value], z.array(horizonSchema).min(1))

}).refine(
  ({predictedDateMin,predictedDateMax,asOfDate}) => predictedDateMin<=predictedDateMax && asOfDate< predictedDateMin,
  {
    message: "predicted dates must be higher than asOfDate",
    path: ["dateMax"],
  }
);

export const createPredictionSchema = z.object({
  maturity: maturitySchema,
  asOfDate: dateSchema,
  predictedDate: dateSchemaPred,
  value: z.float32().min(0).max(20),
  modelType: modelTypeSchema,
  horizon: horizonSchema
}).refine(
  ({asOfDate, predictedDate}) => asOfDate<predictedDate,
  {
    message: "As of date is less than predictedDate"
  }
);

export const createPredictionSchemaBatch = z.object({
  items: z.array(createPredictionSchema).min(1).max(1000)
});



