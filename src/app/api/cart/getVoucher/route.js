import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function GET(req) {

    const searchParams = req.nextUrl.searchParams;
    const voucher = searchParams.get('voucher');

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    const data = await prisma.voucher.findUnique({
        where: {
            id: voucher, // Mengambil keranjang milik user tertentu
        }
    });

    const res = await ResponseData(data, authorization)
    return res
}
