import { prisma } from "@/controllers/prisma";
import { ResponseData } from "@/components/api/ResponseData";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!["wa", "form"].includes(type)) {
        return new Response(
            JSON.stringify({ error: "Invalid type" }),
            { status: 400 }
        );
    }

    // Ambil semua sales
    const salesList = await prisma.sales.findMany();

    if (salesList.length === 0) {
        return new Response(
            JSON.stringify({ error: "Sales not found" }),
            { status: 404 }
        );
    }

    // Cari sales yang paling jauh dari target persentasenya
    const selected = salesList
        .map((sales) => {
            const click =
                type === "wa"
                    ? sales.clickCountWA
                    : sales.clickCountForm;

            const percent =
                type === "wa"
                    ? sales.percentWA
                    : sales.percentForm;

            return {
                ...sales,
                score: click / percent,
            };
        })
        .sort((a, b) => {
            if (a.score === b.score) {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }

            return a.score - b.score;
        })[0];

    // Update click
    const updated = await prisma.sales.update({
        where: {
            id: selected.id,
        },
        data:
            type === "wa"
                ? {
                      clickCountWA: {
                          increment: 1,
                      },
                  }
                : {
                      clickCountForm: {
                          increment: 1,
                      },
                  },
    });

    const result = {
        id: updated.id,
        name: updated.name,
        numberWA: updated.numberWA,
        numberForm: updated.numberForm,
        clickCountWA: updated.clickCountWA,
        clickCountForm: updated.clickCountForm,
    };

    const authorization = req.headers.get("authorization");

    return await ResponseData(result, authorization);
}