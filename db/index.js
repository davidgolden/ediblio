const { PrismaClient } = require('@prisma/client');
const pg = require("pg");
export const prismaClient = new PrismaClient();

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
})