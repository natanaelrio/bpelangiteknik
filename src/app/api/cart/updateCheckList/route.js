import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function PUT(req) {
    const { cartItemId, CHECKLIST } = await req.json()

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.cartItem.update({
            where: {
                id: cartItemId
            },
            data: { checkList: CHECKLIST }
        })

        const res = await ResponseData(data, authorization)
        return res
    }
    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}