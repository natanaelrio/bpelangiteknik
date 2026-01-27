import { Client } from '@elastic/elasticsearch'

export const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTICSEARCH_USER || 'elastic',
        password: process.env.ELASTICSEARCH_PASS || 'changeme',
    },
})

    // ====== CONNECTION CHECK ======
    ; (async () => {
        try {
            const health = await esClient.cluster.health()
            console.log("✅ Elasticsearch connected")
            console.log("Status:", health.status)
        } catch (error) {
            console.error("❌ Elasticsearch connection failed")
            console.error(error.message || error)
        }
    })()
