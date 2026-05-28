import { prisma } from "@/controllers/prisma";

export async function GET(req) {
    const authorization = req.headers.get('authorization');

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
        return Response.json({
            status: 500,
            isSuccess: false,
            message: 'Unauthorized'
        });
    }

    try {
        const { searchParams } = new URL(req.url);
        const salesProgressId = searchParams.get('salesProgressId');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 50;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0;

        const where = {};
        if (salesProgressId) {
            where.salesProgressId = salesProgressId;
        }

        const data = await prisma.salesLog.findMany({
            where,
            include: {
                salesProgress: {
                    select: {
                        id: true,
                        nama: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        });

        const total = await prisma.salesLog.count({ where });

        return Response.json({
            status: 200,
            isSuccess: true,
            data,
            total,
            limit,
            offset
        });
    } catch (error) {
        return Response.json({
            status: 500,
            isSuccess: false,
            message: error.message
        });
    }
}
