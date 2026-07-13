import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function GET(req) {
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization');

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

    const paymentParam = searchParams.get('payment');
    const payment = paymentParam === 'true'
        ? true
        : paymentParam === 'false'
            ? false
            : undefined;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);

    const where = {
        start: {
            gte: startOfMonth,
            lt: endOfMonth,
        },
        ...(payment !== undefined ? { payment } : {}),
    };

    // Order dinamis
    const orderBy = payment === true
        ? { end: 'desc' }
        : { start: 'desc' };

    const data = await prisma.dataPesanan.findMany({
        where,
        orderBy,
        include: {
            dataPesananItems: true
        }
    });

    const totalDataPesanan = data.reduce((acc, cart) => acc + (cart.dataPesananItems?.length || 0), 0);

    const result = {
        month,
        year,
        totalDataPesanan,
        totalCart: data.length,
    };

    return ResponseData(data, authorization, result);
}



export async function PUT(req) {
    const { id, status, noResi } = await req.json()

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.dataPesananItem.updateMany({
            where: {
                id: id
            },
            data: { status, noResi }
        })

        const res = await ResponseData(data, authorization)
        return res
    }
    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}

export async function DELETE(req) {
    const { id } = await req.json()

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        // Hapus semua item di pesanan ini


        // Setelah itu hapus dataPesanan utama
        const data2 = await prisma.dataPesanan.delete({
            where: { id },
        })

        const data = await prisma.dataPesananItem.deleteMany({
            where: { dataPesananId: id },
        })
        const gabung = [...data2, ...data]

        const res = await ResponseData(gabung, authorization)
        return res
    }
    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}