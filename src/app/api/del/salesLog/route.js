import { prisma } from "@/controllers/prisma";

export async function DELETE(req) {
    const authorization = req.headers.get('authorization');

    if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
        return Response.json({
            status: 500,
            isSuccess: false,
            message: 'Unauthorized'
        });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return Response.json({
                status: 400,
                isSuccess: false,
                message: 'ID wajib diisi'
            });
        }

        // Check if record exists
        const exists = await prisma.salesLog.findUnique({ where: { id } });
        if (!exists) {
            return Response.json({
                status: 404,
                isSuccess: false,
                message: 'Log tidak ditemukan'
            });
        }

        const result = await prisma.salesLog.delete({
            where: { id }
        });

        return Response.json({
            status: 200,
            isSuccess: true,
            message: 'Log berhasil dihapus',
            data: result
        });
    } catch (error) {
        return Response.json({
            status: 500,
            isSuccess: false,
            message: error.message
        });
    }
}
