import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
    adapter: process.env.DATABASE_URL, // koneksi langsung ke DB
    // accelerateUrl: process.env.ACCELERATE_URL, // opsional jika pakai Prisma Accelerate
});