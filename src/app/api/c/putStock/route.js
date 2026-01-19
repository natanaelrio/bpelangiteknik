import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function PUT(req) {
    const authorization = req.headers.get('authorization')

    const { slugProduct,
        stockProduct,
        username
    } = await req.json()

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.listProduct.update({
            where: { slugProduct: slugProduct },
            data: {
                updateDate: new Date(),
                stockProduct: Number(stockProduct),
                username: username
            }
        })
        const res = await ResponseData(data, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}
