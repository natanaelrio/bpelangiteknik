import { esClient } from "@/controllers/elasticsearch"

export async function upsertProductToES(product) {
    if (!product?.id) {
        throw new Error("Product ID wajib ada untuk update Elasticsearch")
    }

    try {
        const res = await esClient.update({
            index: "products",
            id: product.id.toString(),
            doc: {
                id: product.id,
                start: product.start,
                productName: product.productName,
                descProduct: product.descProduct,
                descMetaProduct: product.descMetaProduct,
                tagProduct: product.tagProduct,

                stockProduct: product.stockProduct,
                productKategori: product.productKategori,
                productType: product.productType,

                productPrice: product.productPrice?.toString() ?? null,
                productDiscount: product.productDiscount ?? 0,
                productPriceFinal: product.productPriceFinal?.toString() ?? null,

                imageProductUtama: product.imageProductUtama?.secure_url ?? null,
                updateDate: product.updateDate ?? new Date(),

                username: product.username,
                slugProduct: product.slugProduct,
                saveDraf: product.saveDraf,
                viewProduct: product.viewProduct,
                sold: product.sold,
                spekNew: product.spekNew,
                weightProduct: product.weightProduct,
                lengthProduct: product.lengthProduct,
                widthProduct: product.widthProduct,
                heightProduct: product.heightProduct,
                subKategoriProduct: product.subKategoriProduct,
                urlYoutube: product.urlYoutube,
                productKategori: product.productKategori,
            },
            doc_as_upsert: true,
        })

        return res
    } catch (error) {
        console.error("Elasticsearch upsert product error:", error)
        throw error
    }
}
