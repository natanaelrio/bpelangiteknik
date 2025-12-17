import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const merchantOrderId = searchParams.get('merchantOrderId');

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    const data = await prisma.dataPesanan.findMany({
        where: {
            payment: true,
            OR: [
                { merchantOrderId: { contains: merchantOrderId } }, // Contoh pencarian di nama
            ]
        },
        include: {
            dataPesananItems: {
                orderBy: { start: "desc" }
            }
        }
    });

    const res = await ResponseData(data, authorization)
    return res
}
