import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')
    const data = await prisma.listProduct.findMany({
        where: {
            slugProduct: id
        },
        include: {
            spec_product: true,
            url_image_product: true,
            imageProductUtama: true,
            fMerek: true
        }
    })

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}