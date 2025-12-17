import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {

    const data = await prisma.listProduct.findMany({
        orderBy: {
            start: 'desc'
        },
        where: {
            saveDraf: false
        },
        select: {
            slugProduct: true,
        }
    })

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}