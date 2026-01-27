import { prisma } from "@/controllers/prisma";
import { esClient } from "@/controllers/elasticsearch";
import { ResponseData } from "@/components/api/ResponseData";
import { upsertProductToES } from "@/service/elasticSearch/updateElasticSearch";

export async function PUT(req) {
    const authorization = req.headers.get("authorization");

    const {
        slugProduct,
        price,
        username
    } = await req.json();

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
        return Response.json({
            status: 500,
            isCreated: false,
            contact: "natanael rio wijaya 08971041460"
        });
    }

    try {
        // 1️⃣ Update database utama (Prisma)
        const product = await prisma.listProduct.update({
            where: { slugProduct },
            data: {
                updateDate: new Date(),
                productDiscount: 0,
                productPrice: BigInt(price),
                productPriceFinal: BigInt(price),
                username
            },
            include: {
                imageProductUtama: {
                    select: { secure_url: true }
                }
            }
        });

        // 2️⃣ Sync ke Elasticsearch (UPSERT)
        await upsertProductToES(product)

        const res = await ResponseData(
            { message: "Price updated & Elasticsearch synced", product },
            authorization
        );
        return res;

    } catch (err) {
        console.error("UPDATE PRICE ERROR:", err);

        const res = await ResponseData(
            { error: "Update failed", details: err.message },
            authorization,
            500
        );

        return res;
    }
}
