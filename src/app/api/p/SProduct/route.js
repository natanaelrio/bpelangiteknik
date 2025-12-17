import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    const pageID = searchParams.get('page')
    const pageSizeID = searchParams.get('pageSize')
    const take = searchParams.get('take')
    const m = searchParams.get('m')

    const page = parseInt(pageID) || 1;
    const pageSize = pageSizeID > Number(take) ? Number(take) : parseInt(pageSizeID) || Number(take);

    // Jika hasil kali page * pageSize bukan kelipatan 7, ubah jadi 1
    const totalTake = page * pageSize

    // Kumpulan filter utama
    const filters = [
        { saveDraf: false }
    ];

    // Filter brand (merek)
    if (m && m !== 'undefined') {
        filters.push({
            fMerek: {
                some: { name: { in: [m] } },
            },
        });
    }

    // Search ke banyak kolom sekaligus
    if (search) {
        filters.push({
            OR: [
                { productName: { contains: search, mode: 'insensitive' } },
                { subKategoriProduct: { contains: search, mode: 'insensitive' } },
                { productType: { contains: search, mode: 'insensitive' } },
                { tagProduct: { contains: search, mode: 'insensitive' } },
                { descProduct: { contains: search, mode: 'insensitive' } },
                { descMetaProduct: { contains: search, mode: 'insensitive' } },
                { spekNew: { path: ['keyName'], string_contains: search } }, // JSON field oke
                {
                    fMerek: {
                        some: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    }
                }
            ]
        });
    }

    if (tag) {
        filters.push({
            OR: [
                { productName: { contains: tag, mode: 'insensitive' } },
                { subKategoriProduct: { contains: tag, mode: 'insensitive' } },
                { productType: { contains: tag, mode: 'insensitive' } },
                { tagProduct: { contains: tag, mode: 'insensitive' } },
                { descProduct: { contains: tag, mode: 'insensitive' } },
                { descMetaProduct: { contains: tag, mode: 'insensitive' } },
                { spekNew: { path: ['keyName'], string_contains: tag } }
                // { spekNew: { contains: tag, mode: 'insensitive' } },
                // { productPriceFinal: { contains: search, mode: 'insensitive' } },
            ]
        });
    }

    // Filter spesifik tambahan
    // if (sub) {
    //     filters.push({ subKategoriProduct: { contains: sub, mode: 'insensitive' } });
    // }

    // if (type) {
    //     filters.push({ productType: { contains: type, mode: 'insensitive' } });
    // }

    // if (tag) {
    //     filters.push({ tagProduct: { contains: tag, mode: 'insensitive' } });
    // }

    // Gabungkan semua filter dengan AND
    const whereClause = {
        AND: filters
    };

    // Query data
    const data = await prisma.listProduct.findMany({
        take: totalTake,
        orderBy: { start: 'desc' },
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
    });

    const dataPreviewMerek = await prisma.fMerek.findMany({
        include: {
            _count: {
                select: {
                    Merek: {
                        where: whereClause,
                    },
                },
            },
        },
    });

    // Hitung total data
    const totalMaxProduct = await prisma.listProduct.count({
        where: whereClause
    });
    const totalProduct = pageSize * page;

    // Response
    const authorization = req.headers.get('authorization');
    const res = await ResponseData(data, authorization, { totalMaxProduct, totalProduct, dataPreviewMerek });
    return res;
}
