import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query')

    const data = await prisma.categoryProductUtama.findMany({
        where: {
            category: {
                not: null,   // Exclude null values
                not: ''      // Exclude empty strings
            }
        },
        orderBy: {
            start: 'desc'
        },
        include: {
            categoryProduct: {
                where: {
                    categoryProductUtamaId: Number(query)
                }
            }
        }
    });

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}