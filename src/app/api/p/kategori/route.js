import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')
    const m = searchParams.get('m')

    const pageID = searchParams.get('page')
    const pageSizeID = searchParams.get('pageSize')
    const take = searchParams.get('take')

    const page = parseInt(pageID) || 1;
    const pageSize = pageSizeID > Number(take) ? Number(take) : parseInt(pageSizeID) || Number(take);

    // Constructing the "where" object dynamically
    const whereClause = {
        saveDraf: false,
        ...(m !== 'undefined' && { // Hanya tambahkan kondisi jika m bukan "undefined"
            fMerek: {
                some: { name: { in: [m] } },
            },
        }),
    };

    const data = await prisma.categoryProduct.findMany({
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
            _count: {
                select: {
                    listProducts: {
                        where: whereClause
                    }
                }
            },
            listProducts: {
                take: page * pageSize,
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
                    imageProductUtama: {
                        select: {
                            url: true,
                            secure_url: true,
                            asset_id: true,
                            public_id: true,
                        }
                    },
                }
            }
        }
    });

    // Query untuk menghitung jumlah total data
    const totalProduct = pageSize * page

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data[0], authorization, { totalProduct: totalProduct })
    return res
}