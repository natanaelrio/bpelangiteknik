import { prisma } from "@/controllers/prisma"
import CryptoJS from 'crypto-js';

export async function AmbilDataUsers(nota_user) {
    //UPDATE KONDISI PEMBYARAN
    const updateData = await prisma.dataPesanan.update({
        where: {
            merchantOrderId: nota_user,
        },
        data: {
            payment: true
        }
    })

    //AMBIL ID USER
    const data = await prisma.dataPesanan.findUnique({
        where: {
            merchantOrderId: nota_user, // Mengambil keranjang milik user tertentu
        }
    });

    //AMBIL BARANG YG SUDAH TERBAYAR
    const IDCart = await prisma.cart.findMany({
        where: {
            IDCart: data?.cartID, // Mengambil keranjang milik user tertentu
        }, include: {
            items: true
        }
    });

    // AMBIL ID ITEM KARANJANG
    const idItems = IDCart[0].items.map((data) => data.id)

    // HAPUS KERANJANG
    const dataKu = await prisma.cartItem.deleteMany({
        where: {
            checkList: true,
            id: {
                in: idItems, // Hapus item yang ID-nya ada di dalam array ini
            },
            cartId: data?.cartID, // Pastikan item tersebut milik keranjang tertentu
        },
    });
    return { ...updateData, ...dataKu }
}


export async function POST(req, res) {
    const data = await req.formData()
    const merchantCode = data.get('merchantCode')
    const merchantOrderId = data.get('merchantOrderId')
    const amount = data.get('amount')
    const signature = data.get('signature')

    const params = merchantCode + amount + merchantOrderId + process.env.SERVER_KEYDUITKU;
    const calcSignature = CryptoJS.MD5(params).toString();

    if (signature == calcSignature) {
        const data = await AmbilDataUsers(merchantOrderId)
        return Response.json({ data })
    } else {
        return Response.json({ error: 'Bad Signature' });
    }

}