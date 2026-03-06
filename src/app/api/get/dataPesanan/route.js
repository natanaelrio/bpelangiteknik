import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function GET(req) {
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    const data = await prisma.dataPesanan.findMany({
        where: {
            payment_info: {
                not: null
            },
            dataPesananItems: {
                some: {
                    price: {
                        not: 0
                    }
                }
            }
        },
        orderBy: {
            start: "desc"
        },
        select: {
            nama_lengkap_user: true,
            payment_info: true,
            dataPesananItems: {
                where: {
                    price: {
                        not: 0
                    }
                },
                select: {
                    start: true,
                    productName: true,
                    price: true,
                    priceOriginal: true,
                    quantity: true,
                }
            }
        }
    });

    const res = await ResponseData(data, authorization)
    return res
}

