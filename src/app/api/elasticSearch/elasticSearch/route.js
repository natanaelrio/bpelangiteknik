import { esClient } from "@/controllers/elasticsearch"
import { ResponseData } from "@/components/api/ResponseData"

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams

    const rawQuery = searchParams.get("query")
    const query =
        !rawQuery || rawQuery === "undefined"
            ? ""
            : rawQuery.trim()

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "7")

    const from = (page - 1) * limit

    const esQuery = query
        ? {
            multi_match: {
                query,
                fields: [
                    "productName^3",
                    "descProduct",
                    "descMetaProduct",
                    "tagProduct^2",
                ],
            },
        }
        : { match_all: {} }

    const result = await esClient.search({
        index: "products",
        from,
        size: limit,
        sort: [
            { start: { order: "desc" } }  // 👈 sorting terbaru dulu
        ],
        query: esQuery,
    })

    const hits = result.hits.hits.map((hit) => hit._source)
    const total =
        typeof result.hits.total === "number"
            ? result.hits.total
            : result.hits.total?.value || 0

    const authorization = req.headers.get("authorization")

    return ResponseData(
        {
            data: hits
        },
        authorization, {
        totalMaxProduct: total,
        totalProduct: limit,
    })
}
