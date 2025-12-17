import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {

    BigInt.prototype.toJSON = function () {
        return this.toString();
    }

    const data = await prisma.suratPenawaran.findMany({
        orderBy: {
            start: 'desc'
        }
    })

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}