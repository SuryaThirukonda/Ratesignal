import {z} from "zod";


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

//probs not needed
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
})

