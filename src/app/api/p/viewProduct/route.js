import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')
    const authorization = req.headers.get('authorization')

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.listProduct.updateMany({
            where: {
                slugProduct: id
            },
            data: {
                viewProduct: {
                    increment: 1,
                }
            },
        })
        const res = await ResponseData(data, authorization)
        return res
    }

    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}