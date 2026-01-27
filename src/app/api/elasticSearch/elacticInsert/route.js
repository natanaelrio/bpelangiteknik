import { prisma } from "@/controllers/prisma";
import { esClient } from "@/controllers/elasticsearch";
import { ResponseData } from "@/components/api/ResponseData";

export async function POST(req) {
    try {
        const body = await req.json();

        // 1️⃣ Simpan ke database
        const product = await prisma.listProduct.create({ data: body });

        // 2️⃣ Index ke Elasticsearch
        await esClient.index({
            index: "products",
            id: product.id.toString(),
            document: {
                productName: p.productName,
                descProduct: p.descProduct,
                descMetaProduct: p.descMetaProduct,
                tagProduct: p.tagProduct,
                productKategori: p.productKategori,
                productType: p.productType,
                productPrice: p.productPrice,
                productDiscount: p.productDiscount,
                productPriceFinal: p.productPriceFinal,
                imageProductUtama: p.imageProductUtama,
            },
        });

        await esClient.indices.refresh({ index: "products" });

        const authorization = req.headers.get("authorization");
        return ResponseData({ message: "Product added and indexed", product }, authorization);
    } catch (err) {
        console.error(err);
        const authorization = req.headers.get("authorization");
        return ResponseData({ error: "Insert failed", details: err.message }, authorization, 500);
    }
}
