import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const data = await prisma.fMerek.findMany({
        include: {
            _count: {
                select: { Merek: true },
            },
        },
    })

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}