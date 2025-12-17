import { prisma } from "@/controllers/prisma";
import { ResponseData } from "@/components/api/ResponseData";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'wa' atau 'form'

    if (!["wa", "form"].includes(type)) {
        return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
    }

    // ambil sales dengan klik paling sedikit sesuai type
    const sales = await prisma.sales.findFirst({
        orderBy: [
            type === "wa"
                ? { clickCountWA: "asc" }
                : { clickCountForm: "asc" },
            { createdAt: "asc" }
        ],
    });

    if (!sales) {
        return new Response(JSON.stringify({ error: "Sales not found" }), { status: 404 });
    }

    // update counter sesuai type
    await prisma.sales.update({
        where: { id: sales.id },
        data: type === "wa"
            ? { clickCountWA: { increment: 1 } }
            : { clickCountForm: { increment: 1 } },
    });

    // hasil respons
    const result = {
        id: sales.id,
        name: sales.name,
        numberForm: sales.numberForm,
        numberWA: sales.numberWA,
        clickCountWA: sales.clickCountWA + (type === "wa" ? 1 : 0),
        clickCountForm: sales.clickCountForm + (type === "form" ? 1 : 0),
    };

    const authorization = req.headers.get("authorization");
    const res = await ResponseData(result, authorization);
    return res;
}
