import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function GET(req) {

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    const data = await prisma.cart.findUnique({
        where: {
            IDCart: id, // Mengambil keranjang milik user tertentu
        },
        include: {
            dataPesanan: {
                where: { payment: true },
                orderBy: { start: "desc" },
                include: {
                    dataPesananItems: true
                }
            }
        }
    });

    const res = await ResponseData(data, authorization)
    return res
}
