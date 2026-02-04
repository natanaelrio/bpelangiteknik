import { prisma } from "@/controllers/prisma";
import { ResponseData } from "@/components/api/ResponseData";

export async function GET(req) {
    const authorization = req.headers.get("authorization");

    if (authorization === process.env.NEXT_PUBLIC_SECREET) {

        const product = await prisma.listProduct.aggregate({
            _sum: {
                viewProduct: true,
            },
        });

        const artikel = await prisma.postArtikel.aggregate({
            _sum: {
                viewArtikel: true, // sesuaikan dengan nama field di schema
            },
        });

        const data = {
            productView: product._sum.viewProduct ?? 0,
            artikelView: artikel._sum.viewArtikel ?? 0,
            totalView:
                (product._sum.viewProduct ?? 0) +
                (artikel._sum.viewArtikel ?? 0),
        };

        return ResponseData(data, authorization);
    }

    return Response.json({
        status: 500,
        isCreated: false,
        contact: "natanael rio wijaya 08971041460",
    });
}
