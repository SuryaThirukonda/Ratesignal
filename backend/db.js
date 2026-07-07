import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.NEON_CONNECTION_STRING

});

export async function query(text, params = []){
    return pool.query(text,params);
}