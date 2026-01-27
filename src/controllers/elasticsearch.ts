import { Client } from '@elastic/elasticsearch'

export const esClient = new Client({
    node: process.env.ELASTIC_URL || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USER || 'elastic',
        password: process.env.ELASTIC_PASS || 'changeme',
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
