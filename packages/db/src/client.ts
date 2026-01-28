import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/index.js";
import pg from "pg";

// Prisma 7: Adapter-based client instantiation
const connectionString = process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/obsidian_media";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

// Re-export types from generated client
export * from "../generated/client/index.js";
