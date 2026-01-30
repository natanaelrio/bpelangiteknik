import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'
import { UpsertProductToES } from "@/service/elasticSearch/updateElasticSearch";

export async function PUT(req) {
    const authorization = req.headers.get('authorization')

    const { slugProduct,
        saveDraf
    } = await req.json()

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.listProduct.update({
            where: { slugProduct: slugProduct },
            data: { saveDraf },
            include: {
                imageProductUtama: {
                    select: { secure_url: true }
                }
            }
        })
        // 2️⃣ Sync ke Elasticsearch (UPSERT)
        await UpsertProductToES(data)
        const res = await ResponseData(data, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}
