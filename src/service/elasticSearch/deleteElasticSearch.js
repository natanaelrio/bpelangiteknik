'use server'
import { esClient } from "@/controllers/elasticsearch"

export async function DeleteProductFromES(productId) {
    try {
        const response = await esClient.delete({
            index: "products", // sesuaikan dengan nama index kamu
            id: productId
        })

        return response
    } catch (error) {
        // kalau data tidak ada di ES, biasanya akan 404
        if (error?.meta?.statusCode === 404) {
            console.log("Document not found in Elasticsearch:", productId)
            return null
        }

        console.error("Error deleting product from Elasticsearch:", error)
        throw error
    }
}
