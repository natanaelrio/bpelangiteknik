import { esClient } from "@/controllers/elasticsearch";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const keyword = (searchParams.get("q") || "").trim();

        if (!keyword) {
            return Response.json([]);
        }

        const result = await esClient.search({
            index: "products",
            size: 10,

            // 🔥 QUERY (PRIORITAS PHRASE)
            query: {
                bool: {
                    should: [
                        {
                            match_phrase: {
                                productName: {
                                    query: keyword
                                }
                            }
                        },
                        {
                            match: {
                                productName: {
                                    query: keyword,
                                    fuzziness: "AUTO"
                                }
                            }
                        }
                    ]
                }
            },

            // 🔥 HIGHLIGHT (ES)
            highlight: {
                fields: {
                    productName: {
                        type: "unified"
                    }
                },
                pre_tags: ['<span class="highlight">'],
                post_tags: ['</span>'],
                number_of_fragments: 1
            },

            _source: [
                "productName",
                "slugProduct",
                "imageProductUtama",
                "productPriceFinal"
            ],

            
        });

        // =========================
        // 🔥 RESULTS + FULL HIGHLIGHT FIX
        // =========================
        const results =
            result.hits?.hits?.map((hit) => {
                const source = hit._source;
                const name = source.productName;

                // escape keyword biar aman regex
                const escapedKeyword = keyword.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

                const regex = new RegExp(`(${escapedKeyword})`, "gi");

                const manualHighlight = name.replace(
                    regex,
                    `<span class="highlight">$1</span>`
                );

                return {
                    ...source,
                    productNameHighlight:
                        manualHighlight !== name
                            ? manualHighlight
                            : hit.highlight?.productName?.[0] || name
                };
            }) || [];

        return Response.json(results);

    } catch (err) {
        console.error("SEARCH ERROR:", err);

        return Response.json(
            { error: err.message },
            { status: 500 }
        );
    }
}