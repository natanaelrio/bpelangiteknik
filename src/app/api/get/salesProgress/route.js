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
        const id = searchParams.get('id');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0;

        if (id) {
            // Get single record with logs
            const data = await prisma.salesProgress.findUnique({
                where: { id },
                include: {
                    items: true,
                    logs: {
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });

            if (!data) {
                return Response.json({
                    status: 404,
                    isSuccess: false,
                    message: 'Data tidak ditemukan'
                });
            }

            return Response.json({
                status: 200,
                isSuccess: true,
                data
            });
        }

        // Get all records with pagination
        const where = {};
        const status = searchParams.get('status');
        const salesName = searchParams.get('salesName');
        const search = searchParams.get('search');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const paymentStatus = searchParams.get('paymentStatus');

        if (status) {
            where.status = status;
        }

        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }

        if (salesName) {
            where.salesName = salesName;
        }

        if (search) {
            where.OR = [
                { nama: { contains: search, mode: 'insensitive' } },
                { salesName: { contains: search, mode: 'insensitive' } },
                { nomorHp: { contains: search, mode: 'insensitive' } },
                { alamatKota: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = toDate;
            }
        }

        const data = await prisma.salesProgress.findMany({
            where,
            include: {
                items: true,
                logs: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 5 // Only get last 5 logs for list view
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            ...(limit && { take: limit }),
            ...(limit && { skip: offset })
        });

        const total = await prisma.salesProgress.count({ where });

        // Calculate totals
        let totals = { totalUnit: 0, totalDeal: 0, dpp: 0, ppn: 0, totalPayment: 0, sisaPayment: 0 };
        try {
            const allData = await prisma.salesProgress.findMany({
                where,
                select: {
                    totalUnit: true,
                    totalDeal: true,
                    dpp: true,
                    ppn: true,
                    totalPayment: true,
                    sisaPayment: true
                }
            });

            totals = allData.reduce((acc, item) => ({
                totalUnit: acc.totalUnit + (parseFloat(item.totalUnit) || 0),
                totalDeal: acc.totalDeal + (parseFloat(item.totalDeal) || 0),
                dpp: acc.dpp + (parseFloat(item.dpp) || 0),
                ppn: acc.ppn + (parseFloat(item.ppn) || 0),
                totalPayment: acc.totalPayment + (parseFloat(item.totalPayment) || 0),
                sisaPayment: acc.sisaPayment + (parseFloat(item.sisaPayment) || 0)
            }), { totalUnit: 0, totalDeal: 0, dpp: 0, ppn: 0, totalPayment: 0, sisaPayment: 0 });
        } catch (e) {
            console.error('Error calculating totals:', e);
        }

        return Response.json({
            status: 200,
            isSuccess: true,
            data,
            total,
            totals,
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
