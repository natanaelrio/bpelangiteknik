import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const data = await prisma.categoryProduct.findMany({
        where: {
            category: {
                not: null,   // Exclude null values
                not: ''      // Exclude empty strings
            }
        },
        orderBy: {
            start: 'desc'
        }
    });

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}