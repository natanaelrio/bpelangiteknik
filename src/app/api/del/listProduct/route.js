import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'
import { HandleDeleteImageC } from '@/service/handleDeleteImageC';

export async function DELETE(req) {
    const authorization = req.headers.get('authorization')

    const { id } = await req.json()
    if (authorization == process.env.NEXT_PUBLIC_SECREET) {

        // Delete COULDINARY
        const resImage = await prisma.imageProduct.findMany({
            where: {
                IdProduct: id
            }
        })
        const dataImage = resImage.map((data) => data.public_id)


        const resImageUtama = await prisma.imageProductUtama.findMany({
            where: {
                IdProduct: id
            }
        })
        const dataImageUtama = resImageUtama.map((data) => data.public_id)


        const GabungDataPublicID = [...dataImage, ...dataImageUtama]
        await HandleDeleteImageC(GabungDataPublicID)


        const imageProduct = prisma.imageProduct.deleteMany({
            where: {
                IdProduct: id
            }
        })
        const imageProductUtama = prisma.imageProductUtama.deleteMany({
            where: {
                IdProduct: id
            }
        })
        const specProduct = prisma.specProduct.deleteMany({
            where: {
                IdProduct: id
            }
        })
        const listProduct = prisma.listProduct.deleteMany(
            {
                where: {
                    id: id
                }
            }
        )


        const data = await prisma.$transaction([imageProduct, imageProductUtama, specProduct, listProduct])
        const res = await ResponseData(data, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}
