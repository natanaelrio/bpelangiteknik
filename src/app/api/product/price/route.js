import { prisma } from "@/controllers/prisma";
import { UpsertProductToES } from "@/service/elasticSearch/updateElasticSearch";

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const slugProduct = searchParams.get("slugProduct");

    if (!slugProduct) {
        return Response.json(
            { error: "slugProduct is required" },
            { status: 400 }
        );
    }
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };
    try {
        const product = await prisma.listProduct.findUnique({
            where: { slugProduct },
            select: {
                id: true,
                slugProduct: true,
                productName: true,
                productPrice: true,
                productPriceFinal: true,
            },
        });

        if (!product) {
            return Response.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return Response.json(product);
    } catch (error) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { slugProduct, productPrice, productPriceFinal } = body;

        if (!slugProduct) {
            return Response.json(
                { error: "slugProduct is required" },
                { status: 400 }
            );
        }

        const updateData = {};
        if (productPrice !== undefined) {
            updateData.productPrice = BigInt(productPrice);
        }
        if (productPriceFinal !== undefined) {
            updateData.productPriceFinal = BigInt(productPriceFinal);
        }

        if (Object.keys(updateData).length === 0) {
            return Response.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        const product = await prisma.listProduct.update({
            where: { slugProduct },
            data: updateData,
            include: {
                imageProductUtama: {
                    select: { secure_url: true }
                }
            }
        });

        // Invalidate Redis cache
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids: {
                    product: `product:${product.slugProduct}`,
                    listProduct: 'data:productList',
                },
            }),
        });

        // 2️⃣ Sync ke Elasticsearch (UPSERT)
        await UpsertProductToES(product)



        return Response.json(product);
    } catch (error) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
