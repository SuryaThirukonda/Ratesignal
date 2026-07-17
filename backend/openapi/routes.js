import {z} from "zod"
import { getMaturitySchema, createMaturitySchema, createPredictionSchemaBatch } from "../schema"
import { loginUserSchema, createUserSchema } from "../schema"
import { getPredictionSchema, createPredictionSchema, createPredictionSchemaBatch } from "../schema"

import { registry } from "./registry"

