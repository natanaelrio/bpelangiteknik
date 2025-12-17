
import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query')

    const data = await prisma.categoryProduct.findMany({
        where: {
            id: Number(query)
        }
    });

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}