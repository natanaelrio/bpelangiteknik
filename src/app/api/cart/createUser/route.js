import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"
import { customAlphabet } from 'nanoid'

export async function POST(req) {
    const { IDCart, email, name, avatar, clerkUserId } = await req.json()
    const nanoid = customAlphabet('1234567890', 9)

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.cart.upsert({
            where: { email: email },
            update: {
                name,
                avatar
            },
            create: {
                id: Number(nanoid()),
                clerkUserId,
                email,
                IDCart,
                name,
                avatar,
                voucherId: "NOVOUCHER"
            }
        });
        const res = await ResponseData(data, authorization)
        return res
    }
    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}