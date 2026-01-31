import { esClient } from "@/controllers/elasticsearch"
import { ResponseData } from "@/components/api/ResponseData"

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams

    // ================================
    // AMBIL QUERY & FILTER
    // ================================
    const rawQuery = searchParams.get("query")
    const query = !rawQuery || rawQuery === "undefined" ? "" : rawQuery.trim()

    const rawM = searchParams.get("m") || ""
    const m = rawM !== "undefined" ? rawM.trim() : ""

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "7")
    const size = page * limit
    const from = 0

    const mustQuery = []

    // ================================
    // SEARCH QUERY (SPASI + TANPA SPASI)
    // ================================
    if (query) {
        const normalizedQuery = query.replace(/[\s-]+/g, " ")
        const noSpaceQuery = normalizedQuery.replace(/\s+/g, "")

        mustQuery.push({
            bool: {
                should: [
                    {
                        multi_match: {
                            query: normalizedQuery,
                            fields: [
                                "productName^10",
                                "tagProduct^5",
                                "productType^3"
                            ],
                            type: "best_fields",
                            operator: "and",
                            lenient: true
                        }
                    },
                    {
                        multi_match: {
                            query: noSpaceQuery,
                            fields: [
                                "productName^8",
                                "tagProduct^4",
                                "productType^2"
                            ],
                            type: "best_fields",
                            operator: "and",
                            lenient: true
                        }
                    },
                    {
                        multi_match: {
                            query: normalizedQuery,
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
        })
    }

    // ================================
    // FILTER MEREK
    // ================================
    if (m) {
        mustQuery.push({
            terms: { "fMerek.name.keyword": [m] }
        })
    }

    const finalQuery = mustQuery.length
        ? { bool: { must: mustQuery } }
        : { match_all: {} }

    // ================================
    // EXECUTE SEARCH
    // ================================
    const result = await esClient.search({
        index: "products",
        from,
        size,
        sort: [
            { _score: "desc" },
            { start: { order: "desc" } }
        ],
        highlight: {
            pre_tags: ["<mark>"],
            post_tags: ["</mark>"],
            fields: {
                productName: {},
                tagProduct: {},
                productType: {}
            }
        },
        query: finalQuery,

        // ================================
        // SUGGEST DID YOU MEAN
        // ================================
        suggest: query ? {
            did_you_mean: {
                text: query,
                phrase: {
                    field: "productName",
                    size: 3,
                    gram_size: 2,
                    direct_generator: [
                        {
                            field: "productName",
                            field: "productType",
                            suggest_mode: "popular"
                        }
                    ],
                    highlight: {
                        pre_tag: "<mark>",
                        post_tag: "</mark>"
                    }
                }
            }
        } : undefined,

        // ================================
        // AGGREGATION MEREK
        // ================================
        aggs: {
            merekAgg: {
                terms: {
                    field: "fMerek.name.keyword",
                    size: 100
                }
            }
        }
    })

    // ================================
    // PARSE HITS
    // ================================
    const hits = result.hits.hits.map(hit => ({
        ...hit._source,
        highlight: hit.highlight
    }))

    const total =
        typeof result.hits.total === "number"
            ? result.hits.total
            : result.hits.total?.value || 0

    // ================================
    // PARSE SUGGEST
    // ================================
    const suggest =
        result.suggest?.did_you_mean?.[0]?.options?.map(o => o.text) || []

    // ================================
    // PREVIEW MEREK
    // ================================
    const now = new Date().toISOString()
    const dataPreviewMerek =
        result.aggregations?.merekAgg?.buckets?.map(b => ({
            id: b.key,
            name: b.key,
            createdAt: now,
            updatedAt: now,
            _count: { Merek: b.doc_count }
        })) || []

    // ================================
    // AUTHORIZATION
    // ================================
    const authorization = req.headers.get("authorization")

    return ResponseData(
        {
            data: hits
        },
        authorization,
        {
            totalMaxProduct: total,
            totalProduct: limit * page,
            dataPreviewMerek,
            suggest
        }
    )
}
