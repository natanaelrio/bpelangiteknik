import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'
import { customAlphabet } from 'nanoid'

export async function POST(req) {
    const authorization = req.headers.get('authorization')
    const nanoid = customAlphabet('1234567890', 9)

    const { category, slugCategory, urlYoutube, title, desc, tags, image, icon, categoryProductUtamaId
    } = await req.json()

    const data = {
        id: Number(nanoid()),
        category,
        slugCategory,
        urlYoutube,
        title,
        desc,
        tags,
        image,
        icon,
        categoryProductUtamaId
    }

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const CreateList = await prisma.categoryProduct.create({
            data
        })
        const res = await ResponseData(CreateList, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}