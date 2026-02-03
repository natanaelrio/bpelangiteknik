import { esClient } from "@/controllers/elasticsearch"
import { ResponseData } from "@/components/api/ResponseData"

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams

    // ================================
    // QUERY PARAM
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
    // NORMALISASI QUERY
    // ================================
    const normalizedQuery = query.replace(/[\s-]+/g, " ").trim()
    const noSpaceQuery = normalizedQuery.replace(/\s+/g, "")

    // ================================
    // SEARCH QUERY (FUZZY BOLEH)
    // ================================
    if (query) {
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
                            operator: "and",
                            type: "best_fields",
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
                            operator: "and",
                            type: "best_fields",
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
    // HIGHLIGHT QUERY (STRICT URUTAN)
    // ================================
    const highlightQuery = query
        ? {
            bool: {
                should: [
                    {
                        match_phrase: {
                            productName: {
                                query: normalizedQuery,
                                slop: 0
                            }
                        }
                    },
                    {
                        match_phrase: {
                            productName: {
                                query: noSpaceQuery,
                                slop: 0
                            }
                        }
                    }
                ],
                minimum_should_match: 1
            }
        }
        : undefined

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
        query: finalQuery,

        highlight: {
            pre_tags: ["<mark>"],
            post_tags: ["</mark>"],
            fields: {
                productName: {
                    number_of_fragments: 0
                }
            },
            highlight_query: highlightQuery
        },

        // ================================
        // SUGGEST (RAW)
        // ================================
        suggest: query ? {
            did_you_mean: {
                text: query,
                phrase: {
                    field: "productName",
                    gram_size: 2,
                    size: 3,
                    direct_generator: [
                        {
                            field: "productName",
                            suggest_mode: "popular"
                        }
                    ]
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
    // DETEKSI HIGHLIGHT (KUNCI UTAMA)
    // ================================
    const hasHighlight = hits.some(
        item => item.highlight?.productName?.length
    )

    // ================================
    // PARSE & VALIDASI SUGGEST
    // ================================
    const rawSuggest =
        result.suggest?.did_you_mean?.[0]?.options?.map(o => o.text) || []

    const validatedSuggest = []

    for (const s of rawSuggest) {
        const check = await esClient.search({
            index: "products",
            size: 1,
            query: {
                match_phrase: {
                    productName: {
                        query: s,
                        slop: 0
                    }
                }
            }
        })

        if (check.hits.total.value > 0) {
            validatedSuggest.push(s)
        }
    }

    // ================================
    // FINAL SUGGEST (JIKA HIGHLIGHT ADA → KOSONG)
    // ================================
    const finalSuggest = hasHighlight ? [] : validatedSuggest

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
    // RESPONSE
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
            suggest: finalSuggest
        }
    )
}
