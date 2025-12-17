import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')


    const data = await prisma.categoryProductUtama.findMany({
        where: {
            category: {
                not: null,   // Exclude null values
                not: '',
            }, slugCategory: id
        },
        orderBy: {
            start: 'desc'
        },
        include: {
            categoryProduct: true
        }
    });


    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}