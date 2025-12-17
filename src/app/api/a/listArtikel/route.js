import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'
import { customAlphabet } from 'nanoid'

export async function GET(req) {
    try {
        const data = await prisma.postArtikel.findMany({
            take: 7,
            orderBy: {
                start: 'desc',
            },
            include: {
                tagsArtikel: true,
                imageProductArtikel: true,
                categoryArtikel: true,
            },
        });

        const authorization = req.headers.get('authorization');
        const res = await ResponseData(data, authorization);
        return res;
    } catch (error) {
        console.error('Error fetching artikel:', error);
        return new Response(
            JSON.stringify({ message: 'Gagal mengambil data artikel', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function POST(req) {
    const nanoid = customAlphabet('1234567890', 9)
    const authorization = req.headers.get('authorization')
    const {
        IdArtikel,
        title,
        slug,
        content,
        description,
        // tags,
        saveDraf,
        categoryArtikelId,
        dataImage,
        newTags,
        tagDelete,
        productSlugs, // 👈 array slug produk
        productSlugsDelete
    } = await req.json()

    const tagsArtikelnya = newTags.split(", ")
    const tagsArtikelDelete = tagDelete.split(", ")
    const productSlugsDeletedata = productSlugsDelete.split(", ")

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const CreateList = await prisma.postArtikel.upsert({
            where: { slug: slug },
            create: {
                id: Number(nanoid()),
                title,
                slug,
                content,
                description,
                // tags,
                saveDraf,
                categoryArtikelId,
                tagsArtikel: {
                    connectOrCreate: tagsArtikelnya.map((tagName) => ({
                        where: { name: tagName },
                        create: { name: tagName },
                    })),
                },
                imageProductArtikel: { create: dataImage },
                relatedProducts: { // ✅ pindahkan ke sini
                    connectOrCreate: productSlugs.map((slugProduct) => ({
                        where: { slugProduct },
                        create: {
                            slugProduct: slugProduct,
                            productKategori: 4,
                        },
                    })),
                },
            }, update: {
                title,
                slug,
                content,
                description,
                // tags,
                saveDraf,
                categoryArtikelId,
                tagsArtikel: {
                    disconnect: tagsArtikelDelete.map((tagName) => ({
                        name: tagName, // Memutus hubungan berdasarkan nama tag
                    })),
                    connectOrCreate: tagsArtikelnya.map((tagName) => ({
                        where: { name: tagName },
                        create: { name: tagName },
                    })),
                },
                imageProductArtikel: {
                    create: dataImage, // bikin ulang dengan data baru
                    // deleteMany: {} // hapus semua relasi lama
                },
                relatedProducts: { // ✅ sama juga di update
                    disconnect: productSlugsDeletedata.map((slugProduct) => ({
                        slugProduct: slugProduct,
                        productKategori: 4,
                    })),
                    connectOrCreate: productSlugs.map((slugProduct) => ({
                        where: { slugProduct },
                        create: {
                            slugProduct: slugProduct,
                            productKategori: 4,
                        },
                    })),
                },
            }
        })

        const res = await ResponseData(CreateList, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}

export async function PUT(req) {
    const authorization = req.headers.get('authorization')

    const {
        IdArtikel,
        title,
        slug,
        content,
        description,
        tags,
        saveDraf,
        categoryArtikelId,
        dataImage,
        newTags
    } = await req.json()

    const tagsArtikelnya = newTags.split(", ")

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.postArtikel.updateMany({
            where: { id: IdArtikel },
            data: {
                categoryArtikelId,
                title,
                slug,
                content,
                description,
                tags,
                saveDraf,
                tagsArtikel: {
                    disconnect: [], // Hapus hubungan tag yang ada jika perlu
                    // connectOrCreate: tagsArtikelnya.map((tagName) => ({
                    //     where: { name: tagName },
                    //     create: { name: tagName },
                    // })),
                },
            }
        })

        for (const image of dataImage) {
            await prisma.imageProductArtikel.create({
                data: { ...image, IdProductArtikel: IdArtikel }
            })
        }
        const res = await ResponseData(data, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}

export async function DELETE(req) {
    const authorization = req.headers.get('authorization')

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const {
        IdProductArtikel,
    } = await req.json()


    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const CreateList = await prisma.imageProductArtikel.deleteMany({
            where: {
                IdProductArtikel
            },
        })
        const res = await ResponseData(CreateList, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}