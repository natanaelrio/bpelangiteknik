import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const data = await prisma.tagArtikel.findMany()

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}