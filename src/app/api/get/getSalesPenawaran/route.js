import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const authorization = req.headers.get('authorization')

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const GetPenawaran = await prisma.salesPenawaran.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                items: {
                    include: {
                        relatedProducts: {
                            select: {
                                productType: true
                            }
                        }
                    }
                }
            }
        })

        const res = await ResponseData(GetPenawaran, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}