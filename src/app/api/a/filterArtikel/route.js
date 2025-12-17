import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    const data = await prisma.postArtikel.findMany({
        where: {
            tagsArtikel: {
                some: {
                    name: { in: ['Genset'] }, // Filter jika tag ada di daftar
                },
            },
        },
        include: {
            tagsArtikel: true, // Sertakan relasi tag
        },
    });

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}