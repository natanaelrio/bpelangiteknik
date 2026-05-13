import { prisma } from "@/controllers/prisma";
import { ResponseData } from "@/components/api/ResponseData";

export async function DELETE(req) {
    const authorization = req.headers.get("authorization");

    if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
        return Response.json({
            status: 500,
            isDeleted: false,
            contact: "natanael rio wijaya 08971041460"
        });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({
                status: 400,
                message: "ID wajib diisi"
            });
        }

        const deletePenawaran = await prisma.salesPenawaran.delete({
            where: {
                id
            }
        });

        const res = await ResponseData(deletePenawaran, authorization);
        return res;

    } catch (error) {
        return Response.json({
            status: 500,
            isDeleted: false,
            message: error.message
        });
    }
}