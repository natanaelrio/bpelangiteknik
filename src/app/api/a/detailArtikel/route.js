import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    const data = await prisma.postArtikel.findUnique({
        where: {
            slug: id
        },
        include: {
            tagsArtikel: true,
            imageProductArtikel: true,
            categoryArtikel: {
                select: {
                    id: true,
                    category: true,   // ambil nama kategori
                }
            },
            relatedProducts: {
                include: {
                    imageProductUtama: true // ambil gambar utama dari produk terkait
                }
            }
        }
    })

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}