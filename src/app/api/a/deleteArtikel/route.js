import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'
import { HandleDeleteImageC } from '@/service/handleDeleteImageC';

export async function DELETE(req) {
    const authorization = req.headers.get('authorization')

    const { id } = await req.json()
    if (authorization == process.env.NEXT_PUBLIC_SECREET) {

        // Delete COULDINARY
        const resImage = await prisma.imageProductArtikel.findMany({
            where: {
                IdProductArtikel: id
            }
        })
        const dataImage = resImage.map((data) => data.public_id)

        await HandleDeleteImageC(dataImage)


        const imageProduct = prisma.imageProductArtikel.deleteMany({
            where: {
                IdProductArtikel: id
            }
        })
        const postArtikel = prisma.postArtikel.deleteMany({
            where: {
                id: id
            }
        })

        const data = await prisma.$transaction([imageProduct, postArtikel])
        const res = await ResponseData(data, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}
