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
            user: {
                include: {
                    categoryProductUtama: true,
                }
            },
            spec_product: true,
            url_image_product: {
                select: {
                    url: true,
                    secure_url: true,
                    asset_id: true,
                    public_id: true,
                }
            },
            imageProductUtama: {
                select: {
                    url: true,
                    secure_url: true,
                    asset_id: true,
                    public_id: true,
                }
            },
            fMerek: true,
        }
    })

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}