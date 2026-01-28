import { defineConfig } from "@prisma/config";

export default defineConfig({
    earlyAccess: true,
    schema: "./prisma/schema.prisma",

    datasource: {
        url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/obsidian_media",
    },
});
