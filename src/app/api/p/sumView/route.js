import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const authorization = req.headers.get('authorization')

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.listProduct.aggregate({
            _sum: {
                viewProduct: true,
            },
        });
        const res = await ResponseData(data, authorization)
        return res
    }

    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}