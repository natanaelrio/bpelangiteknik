/** @type {import('next').NextConfig} */
const nextConfig = {
    api: {
        bodyParser: {
            sizeLimit: '100mb', // Ubah ini sesuai kebutuhan
        },
    },
    images: {
        domains: [
            'localhost:3000',
            'pelangiteknik.com',
            'localhost',
            'amazonaws.com',
            'tsuzumi-bucket.s3.ap-southeast-1.amazonaws.com',
            'tsuzumi-bucket.s3.amazonaws.com',
            'pelangiteknik.vercel.app',
            'vercel.app',
            'res.cloudinary.com',
            'cloudinary.com'
        ],
    }, async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version,Authorization,x-request-id" },
                    // { key: "Cross-Origin-Opener-Policy", value: "same-origin" }
                ]
            },
        ]
    }
};
module.exports = nextConfig
