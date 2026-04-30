import { prisma } from "@/controllers/prisma";
import { esClient } from "@/controllers/elasticsearch";
import { ResponseData } from "@/components/api/ResponseData";

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        // =========================
        // 1. DELETE INDEX (JIKA ADA)
        // =========================
        const exists = await esClient.indices.exists({ index: "products" });

        if (exists) {
            await esClient.indices.delete({ index: "products" });
        }

        // =========================
        // 2. CREATE INDEX (MAPPING)
        // =========================
        await esClient.indices.create({
            index: "products",
            mappings: {
                properties: {
                    productName: { type: "text" },

                    // 🔥 AUTOCOMPLETE
                    suggest: { type: "completion" },

                    descMetaProduct: { type: "text" },
                    tagProduct: { type: "keyword" },
                    productType: { type: "keyword" },
                    productKategori: { type: "keyword" },

                    productPrice: { type: "long" },
                    productPriceFinal: { type: "long" },

                    sold: { type: "integer" },
                    viewProduct: { type: "integer" },

                    slugProduct: { type: "keyword" },
                    imageProductUtama: { type: "keyword" }
                }
            }
        });

        // =========================
        // 3. AMBIL DATA PRISMA
        // =========================
        const products = await prisma.listProduct.findMany({
            include: {
                imageProductUtama: {
                    select: { secure_url: true }
                },
                fMerek: true
            }
        });

        // =========================
        // 4. FORMAT BULK DATA
        // =========================
        const body = products.flatMap((p) => {
            if (p.saveDraf) return []; // skip draft

            return [
                {
                    index: {
                        _index: "products",
                        _id: p.id.toString()
                    }
                },
                {
                    id: p.id.toString(),
                    productName: p.productName,

                    // 🔥 COMPLETION FIELD
                    suggest: {
                        input: [
                            p.productName,
                            p.fMerek?.name,
                            ...(p.tagProduct || [])
                        ].filter(Boolean),
                        weight:
                            (p.sold || 0) +
                            Number(p.viewProduct || 0)
                    },

                    descMetaProduct: p.descMetaProduct,
                    tagProduct: p.tagProduct,
                    productType: p.productType,
                    productKategori: p.productKategori,

                    productPrice: Number(p.productPrice || 0),
                    productPriceFinal: Number(p.productPriceFinal || 0),

                    imageProductUtama:
                        p.imageProductUtama?.secure_url || null,

                    slugProduct: p.slugProduct,

                    sold: p.sold || 0,
                    viewProduct: Number(p.viewProduct || 0)
                }
            ];
        });

        // =========================
        // 5. BULK INDEX
        // =========================
        let bulkInfo = null;

        if (body.length > 0) {
            const bulkResponse = await esClient.bulk({
                refresh: true,
                body
            });

            if (bulkResponse.errors) {
                bulkInfo = bulkResponse.items.filter(
                    (item) => item.index?.error
                );
                console.log("BULK ERROR:", bulkInfo);
            }
        }

        // =========================
        // 6. RESPONSE
        // =========================
        const authorization = req.headers.get("authorization");

        return await ResponseData(
            {
                message: "Reindex success",
                total: products.length,
                indexed: body.length / 2,
                bulkError: bulkInfo
            },
            authorization
        );
    } catch (err) {
        console.error("REINDEX ERROR:", err);

        const authorization = req.headers.get("authorization");

        return await ResponseData(
            {
                error: "Reindex failed",
                details: err.message
            },
            authorization,
            500
        );
    }
}