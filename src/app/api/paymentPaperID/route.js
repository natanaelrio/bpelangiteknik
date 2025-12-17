import { prisma } from "@/controllers/prisma"

export async function AmbilDataUsers(nota_user, payment_info) {
    //UPDATE KONDISI PEMBYARAN
    const updateData = await prisma.dataPesanan.update({
        where: {
            reference: nota_user,
        },
        data: {
            payment: true,
            payment_info: JSON.stringify(payment_info)
        }
    })

    //AMBIL ID USER
    const data = await prisma.dataPesanan.findUnique({
        where: {
            reference: nota_user, // Mengambil keranjang milik user tertentu
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
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };
    const { additional_info, payment_info } = await req.json()
    // const sh512 = sha512(ref_id + status_code + gross_amount + process.env.SERVER_MIDSTRANSDEMO)
    const uuid = additional_info?.invoices?.[0]?.uuid || null;

    if (uuid) {
        const data = await AmbilDataUsers(uuid, payment_info)
        return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
}