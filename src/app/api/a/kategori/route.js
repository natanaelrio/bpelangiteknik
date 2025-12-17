import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function GET(req) {
    const data = await prisma.categoryArtikel.findMany({
        orderBy: {
            start: 'desc'
        }
    })

    const authorization = req.headers.get('authorization')
    const res = await ResponseData(data, authorization)
    return res
}


export async function POST(req) {
    const authorization = req.headers.get('authorization')

    const { category, slugCategory, urlYoutube, title, desc, tags, image
    } = await req.json()

    const data = {
        category, slugCategory, urlYoutube, title, desc, tags, image
    }

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const CreateList = await prisma.categoryArtikel.create({
            data
        })


        const res = await ResponseData(CreateList, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}