import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams

    const pageID = searchParams.get('page')
    const pageSizeID = searchParams.get('pageSize')
    const take = searchParams.get('take')
    const m = searchParams.get('m')

    const page = parseInt(pageID) || 1;
    const pageSize = pageSizeID > Number(take) ? Number(take) : parseInt(pageSizeID) || Number(take);

    const data = await prisma.listProduct.findMany({
        // skip: (page - 1) * pageSize,
        take: page * pageSize,
        orderBy: {
            start: 'desc'
        },
        where: {
            saveDraf: false,
            // fMerek: m == 'undefined' ? { none: {} } : { some: { name: { in: [m] } } }
            fMerek: m == 'undefined' ? {} : { some: { name: { in: [m] } } }
        },
        select: {
            id: true,
            start: true,
            end: true,
            productName: true,
            slugProduct: true,
            stockProduct: true,
            viewProduct: true,
            subKategoriProduct: true,
            productType: true,
            tagProduct: true,
            productPrice: true,
            productDiscount: true,
            productPriceFinal: true,
            weightProduct: true,
            heightProduct: true,
            widthProduct: true,
            lengthProduct: true,
            imageProductUtama: {
                select: {
                    url: true,
                    secure_url: true,
                    asset_id: true,
                    public_id: true,
                }
            }
        }
    })

    const totalMaxProduct = await prisma.listProduct.count();
    const totalProduct = pageSize * page

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization, { totalMaxProduct, totalProduct })
    return res
}