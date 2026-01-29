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
    const normalizedQuery = query?.trim();
    const noSpaceQuery = normalizedQuery?.replace(/\s+/g, "");

    const esQuery = normalizedQuery
        ? {
            bool: {
                must: [
                    {
                        bool: {
                            should: [
                                // ==========================
                                // 1️⃣ EXACT MATCH (PRIORITAS)
                                // ==========================
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

                                // ==========================
                                // 2️⃣ EXACT MATCH NO SPACE
                                // ==========================
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

                                // ==========================
                                // 3️⃣ FUZZY MATCH (CADANGAN)
                                // ==========================
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
                    }
                ]
            }
        }
        : { match_all: {} };

    const result = await esClient.search({
        index: "products",
        from,
        size: limit,
        highlight: {
            pre_tags: ["<mark>"],
            post_tags: ["</mark>"],
            fields: {
                productName: {},
                tagProduct: {},
                productType: {}
            }
        },
        sort: [
            { _score: "desc" },
            { start: { order: "desc" } }
        ],
        query: esQuery,
    })

    const hits = result.hits.hits.map(hit => ({
        ...hit._source,
        highlight: hit.highlight
    }));

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
