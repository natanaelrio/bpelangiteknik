import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    const data = await prisma.cart.findUnique({
        where: {
            IDCart: id, // Mengambil keranjang milik user tertentu
        },
        include: {
            voucher: true,
            ongkosKirim: {
                select: {
                    id: true,
                    productName: true,
                    price: true,
                    quantity: true
                }
            },
            formData: {
                select: {
                    nama_lengkap_user: true,
                    alamat_lengkap_user: true,
                    alamat_detail: true,
                    kode_pos_user: true,
                    no_hp_user: true,
                    catatan_pengiriman: true,
                    province: true,
                    city: true,
                },
            },
            items: {
                orderBy: { id: "desc" },
                include: {
                    product: {
                        include: {
                            imageProductUtama: true
                        }
                    }, // Mengambil detail produk untuk setiap item di keranjang
                },
            }
        },
    });

    const res = await ResponseData(data, authorization)
    return res
}
