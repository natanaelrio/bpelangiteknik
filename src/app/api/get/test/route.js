import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {

    const data = await prisma.imageProduct.findMany({
        where: {
            IdProduct: 16
        }
    })
    const dataImage = data.map((data) => data.public_id)


    const dataUtama = await prisma.imageProductUtama.findMany({
        where: {
            IdProduct: 16
        }
    })
    const dataImageUtama = dataUtama.map((data) => data.public_id)


    const GabungDataPublicID = [...dataImage, ...dataImageUtama]


    const authorization = req.headers.get('authorization')
    const res = await ResponseData(GabungDataPublicID, authorization)
    return res
}