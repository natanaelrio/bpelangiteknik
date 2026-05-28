import { prisma } from "@/controllers/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        // =========================
        // BIGINT SERIALIZER
        // =========================
        BigInt.prototype.toJSON = function () {
            return this.toString();
        };

        // =========================
        // AUTHORIZATION
        // =========================
        const authorization = req.headers.get("authorization");

        if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
            return NextResponse.json({
                status: 401,
                isSuccess: false,
                message: "Unauthorized"
            });
        }

        // =========================
        // QUERY PARAMS
        // =========================
        const { searchParams } = new URL(req.url);

        const limitParam = parseInt(searchParams.get("limit"));
        const offsetParam = parseInt(searchParams.get("offset"));

        const limit = !isNaN(limitParam) ? limitParam : 50;
        const offset = !isNaN(offsetParam) ? offsetParam : 0;

        const salesName = searchParams.get("salesName");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const action = searchParams.get("action");

        // =========================
        // WHERE FILTER
        // =========================
        const where = {};

        // Filter Sales
        if (salesName && salesName !== "all") {
            where.actorName = salesName;
        }

        // Filter Action
        if (action && action !== "all") {
            where.action = action;
        }

        // Filter Date
        if (dateFrom || dateTo) {
            where.createdAt = {};
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);

            if (!isNaN(fromDate.getTime())) {
                fromDate.setHours(0, 0, 0, 0);
                where.createdAt.gte = fromDate;
            }
        }

        if (dateTo) {
            const toDate = new Date(dateTo);

            if (!isNaN(toDate.getTime())) {
                toDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = toDate;
            }
        }

        // =========================
        // GET DATA
        // =========================
        const data = await prisma.salesLog.findMany({
            where,
            include: {
                salesProgress: {
                    select: {
                        id: true,
                        nama: true,
                        status: true,
                        salesName: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit,
            skip: offset
        });

        // =========================
        // TOTAL
        // =========================
        const total = await prisma.salesLog.count({
            where
        });

        // =========================
        // SALES NAME FILTER
        // =========================
        const salesNames = await prisma.salesLog.findMany({
            select: {
                actorName: true
            },
            distinct: ["actorName"],
            where: {
                actorName: {
                    not: null
                }
            },
            orderBy: {
                actorName: "asc"
            }
        });

        // =========================
        // ACTION FILTER
        // =========================
        const actions = await prisma.salesLog.findMany({
            select: {
                action: true
            },
            distinct: ["action"],
            orderBy: {
                action: "asc"
            }
        });

        // =========================
        // RESPONSE
        // =========================
        return NextResponse.json({
            status: 200,
            isSuccess: true,
            message: "Success",
            data,
            total,
            limit,
            offset,
            salesNames: salesNames
                .map((item) => item.actorName)
                .filter(Boolean),

            actions: actions
                .map((item) => item.action)
                .filter(Boolean)
        });

    } catch (error) {
        console.error("GET SALES LOG ERROR:", error);

        return NextResponse.json({
            status: 500,
            isSuccess: false,
            message: error?.message || "Internal Server Error"
        });
    }
}