import { prisma } from "@/controllers/prisma"
import { sha512, sha384, sha512_256, sha512_224 } from 'js-sha512';

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

    // AMBIL ID ITEM KARANJANG Product
    const idItemsProduct = IDCart[0].items.map((data) => {
        return (
            {
                "idproduct": data.productId,
                "quantity": data.quantity
            }
        )
    })

    // INCREMENT PENJUALAN
    for (const id of idItemsProduct) {
        await prisma.listProduct.update({
            where: { id: id.idproduct },
            data: {
                sold: {
                    increment: id.quantity, // Sesuaikan jika nilai increment berbeda
                },
            },
        });
    }



    return { ...updateData, ...dataKu, ...idItemsProduct }
}

export async function POST(req, res) {
    const { order_id, status_code, gross_amount, signature_key } = await req.json()

    const sh512 = sha512(order_id + status_code + gross_amount + process.env.SERVER_MIDSTRANS)
    if (sh512 == signature_key && status_code == 200) {
        const data = await AmbilDataUsers(order_id)
        return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
}