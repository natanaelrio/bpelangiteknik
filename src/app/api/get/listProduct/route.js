import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams

    const pageID = searchParams.get('page')
    const pageSizeID = searchParams.get('pageSize')
    const take = searchParams.get('take')
    const m = searchParams.get('m')
    const search = searchParams.get('search');

    const page = parseInt(pageID) || 1;
    const pageSize = pageSizeID > Number(take) ? Number(take) : parseInt(pageSizeID) || Number(take);

    const whereClause = {
        ...(m !== 'undefined' && { // Hanya tambahkan kondisi jika m bukan "undefined"
            fMerek: {
                some: { name: { in: [m] } },
            },
        }),
    };

    if (search !== 'undefined') {
        whereClause.productName = {
            contains: search,
            mode: 'insensitive',
        };
    }

    const data = await prisma.listProduct.findMany({
        // skip: (page - 1) * pageSize,
        take: page * pageSize,
        // take: 10,
        orderBy: {
            start: 'desc'
        },
        where: whereClause,
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
            username: true,
            saveDraf: true,
            fMerek: true,
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
            },
            url_image_product: {
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
    // Query untuk menghitung jumlah total data
    const totalMaxProductSearch = await prisma.listProduct.count({
        where: whereClause
    })

    const totalProduct = pageSize * page

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization, { totalMaxProduct: search !== 'undefined' || m !== 'undefined' ? totalMaxProductSearch : totalMaxProduct, totalProduct })
    return res
}