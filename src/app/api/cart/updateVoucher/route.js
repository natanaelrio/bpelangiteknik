import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function PUT(req) {
    const { IDCart, voucherId } = await req.json()

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        try {
            const data = await prisma.cart.update({
                where: {
                    IDCart: IDCart
                },
                data: { voucherId: voucherId }
            })

            const res = await ResponseData(data, authorization)
            return res
        }
        catch (e) {
            return new Response(JSON.stringify({ isCreated: false, contact: 'natanael rio wijaya 08971041460' }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }
    }
    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}