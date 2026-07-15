import {z} from "zod";


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

const horizonSchema = z.enum([
  "1",
  "5",
  "20"
]);

export const getMaturitySchema = z.object({
  maturity: z.preprocess(value => Array.isArray(value) ? value: [value], z.array(z.string()).min(1).max(11)),
  dateMin: z.string().min(5).max(15),
  dateMax: z.string().min(5).max(15),
  sortByDate: z.string().min(3).max(4).default("asc")


});

export const createMaturitySchema = z.object({
  maturity: z.string().min(2, "Enter a valid maturity").max(4, "Enter a valid maturity"),
  date: z.string().min(5).max(15),
  value: z.float32(),
});

//batch upload schema
export const createMaturitySchemaBatch = z.object({
  items: z.array(createMaturitySchema).min(1).max(1000)
});


//predictions schemas

export const getPredictionSchema = z.object({
  maturity: z.preprocess(value => Array.isArray(value) ? value: [value], z.array(z.string()).min(1).max(11)),
  asOfDate: z.string().min(5).max(15),
  predictedDateMin: z.string().min(5).max(15),
  predictedDateMax: z.string().min(5).max(15),
  sortByDate: z.string().min(3).max(4).default("asc"),
  modelType: z.preprocess(value => Array.isArray(value) ? value: [value], z.array(z.string()).min(1).max(13)),
  horizon: z.preprocess(value => Array.isArray(value)? value: [value], z.array(z.int()))

});

export const createPredictionSchema = z.object({
  maturity: z.string().min(2, "Enter a valid maturity").max(4, "Enter a valid maturity"),
  asOfDate: z.string().min(5).max(15),
  predictedDate: z.string().min(5).max(15),
  value: z.float32(),
  modelType: z.string().min(2).max(20),
  horizon: z.int()
});

export const createPredictionSchemaBatch = z.object({
  items: z.array(createPredictionSchema).min(1).max(1000)
});



