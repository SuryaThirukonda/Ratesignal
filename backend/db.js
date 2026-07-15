/*
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.NEON_CONNECTION_STRING

});

export async function query(text, params = []){
    return pool.query(text,params);
}
*/

import PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const { PrismaClient } = PrismaPkg;

const adapter = new PrismaPg({
  connectionString: process.env.NEON_CONNECTION_STRING,
});

export const prisma = new PrismaClient({ adapter });
