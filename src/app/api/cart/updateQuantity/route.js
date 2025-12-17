import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function PUT(req) {
    const { cartItemId, QUANTITY } = await req.json()

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    const data = await prisma.cartItem.update({
        where: {
            id: cartItemId
        },
        data: { quantity: QUANTITY }
    })

    const res = await ResponseData(data, authorization)
    return res
}
