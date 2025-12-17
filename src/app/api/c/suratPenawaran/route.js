import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function POST(req) {
    const authorization = req.headers.get('authorization')

    const { nameProduct, name, email, noHP, note, slugProduct, sales
    } = await req.json()

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const CreateList = await prisma.suratPenawaran.create({
            data: {
                nameProduct,
                name,
                email,
                noHP,
                note,
                slugProduct,
                sales
            }
        })
        const res = await ResponseData(CreateList, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}

export async function PUT(req) {
    const { id, note } = await req.json()

    const authorization = req.headers.get('authorization')
    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.suratPenawaran.update({
            where: {
                id: id
            },
            data: { note: note }
        })

        const res = await ResponseData(data, authorization)
        return res
    }
    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}