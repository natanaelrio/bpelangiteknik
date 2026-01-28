import { esClient } from "@/controllers/elasticsearch"
import { ResponseData } from "@/components/api/ResponseData"

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams

    // ================================
    // AMBIL QUERY & FILTER MEREK
    // ================================
    const rawQuery = searchParams.get("query")
    const query = !rawQuery || rawQuery === "undefined" ? "" : rawQuery.trim()

    const rawM = searchParams.get("m") || ""
    const m = rawM !== "undefined" ? rawM.trim() : ""


    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "7")
    const from = (page - 1) * limit

    const mustQuery = []

    // SEARCH QUERY (support spasi & tanpa spasi)
    if (query) {
        const normalizedQuery = query
            .trim()
            .replace(/[\s-]+/g, "");
        const noSpaceQuery = normalizedQuery.replace(/\s+/g, "");

        mustQuery.push({
            bool: {
                should: [
                    {
                        multi_match: {
                            query: normalizedQuery,
                            fields: [
                                "productName^6",
                                "tagProduct^3",
                                "productType^2"
                            ],
                            type: "best_fields",
                            fuzziness: "AUTO",
                            operator: "and",
                            lenient: true
                        }
                    },
                    {
                        multi_match: {
                            query: noSpaceQuery,
                            fields: [
                                "productName^4",
                                "tagProduct^2",
                                "productType"
                            ],
                            fuzziness: "AUTO",
                            lenient: true
                        }
                    }
                ],
                minimum_should_match: 1
            }
        });
    }


    // FILTER MEREK
    if (m) {
        mustQuery.push({
            terms: { "fMerek.name.keyword": [m] } // exact match
        })
    }

    const finalQuery = mustQuery.length > 0 ? { bool: { must: mustQuery } } : { match_all: {} }

    // ================================
    // SEARCH HITS DENGAN PAGINATION + AGGREGATION
    // ================================

    const result = await esClient.search({
        index: "products",
        from,
        size: limit * page,
        sort: [{ start: { order: "desc" } }],
        query: finalQuery,
        aggs: {
            merekAgg: {
                terms: {
                    field: "fMerek.name.keyword",
                    size: 100 // jumlah maksimal merek yang ditampilkan
                }
            }
        }
    })

    // ================================
    // AMBIL HITS
    // ================================
    const hits = result.hits.hits.map(hit => hit._source)
    const total = typeof result.hits.total === "number" ? result.hits.total : result.hits.total?.value || 0

    // ================================
    // DATA PREVIEW MEREK DARI AGGREGATION
    // ================================
    const now = new Date().toISOString()
    const dataPreviewMerek = (result.aggregations?.merekAgg?.buckets || []).map(bucket => ({
        id: bucket.key,
        name: bucket.key,
        createdAt: now,
        updatedAt: now,
        _count: { Merek: bucket.doc_count }
    }))

    // ================================
    // AUTHORIZATION
    // ================================
    const authorization = req.headers.get("authorization")

    return ResponseData(
        { data: hits },
        authorization,
        {
            totalMaxProduct: total,
            totalProduct: limit * page,
            dataPreviewMerek
        }
    )
}
