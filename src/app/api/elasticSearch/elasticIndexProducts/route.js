import { prisma } from "@/controllers/prisma";
import { esClient } from "@/controllers/elasticsearch";
import { ResponseData } from "@/components/api/ResponseData";

export async function GET(req) {
    try {
        // Ambil semua produk dari Prisma
        const products = await prisma.listProduct.findMany({
            include: {
                imageProductUtama: {
                    select: {
                        secure_url: true
                    }
                },
                fMerek: true
            }
        });

        // Index semua produk ke Elasticsearch
        const body = products.flatMap(p => [
            { index: { _index: "products", _id: p.id.toString() } },
            {
                id: p.id.toString(),
                start: p.start,
                productName: p.productName,
                // descProduct: p.descProduct,
                descMetaProduct: p.descMetaProduct,
                tagProduct: p.tagProduct,
                productType: p.productType,
                productPrice: p.productPrice.toString(),
                productDiscount: p.productDiscount,
                productPriceFinal: p.productPriceFinal.toString(),
                imageProductUtama: p.imageProductUtama?.secure_url,
                fMerek: p.fMerek,

                username: p.username,
                updateDate: p.updateDate,
                slugProduct: p.slugProduct,
                saveDraf: p.saveDraf,
                stockProduct: p.stockProduct,
                sold: p.sold,
                spekNew: p.spekNew,
                viewProduct: Number(p.viewProduct),
                weightProduct: Number(p.weightProduct),
                lengthProduct: Number(p.lengthProduct),
                widthProduct: Number(p.widthProduct),
                heightProduct: Number(p.heightProduct),
                subKategoriProduct: p.subKategoriProduct,
                urlYoutube: p.urlYoutube,
                productKategori: p.productKategori,
            },
        ]);

        // Bulk indexing lebih cepat
        await esClient.bulk({ refresh: true, body });

        // Response
        const authorization = req.headers.get('authorization');
        const res = await ResponseData(
            { message: `${products.length} products indexed successfully` },
            authorization
        );
        return res;
    } catch (err) {
        console.error("IndexAllProducts error:", err);
        const authorization = req.headers.get('authorization');
        const res = await ResponseData(
            { error: "Indexing failed", details: err.message },
            authorization,
            500
        );
        return res;
    }
}
