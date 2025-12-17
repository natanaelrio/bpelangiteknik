import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"

export async function GET(req) {

    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    const data = await prisma.cart.findUnique({
        where: {
            email: email, // Mengambil keranjang milik user tertentu
        }, include: {
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
                    kode_pos_user: true,
                    no_hp_user: true,
                    catatan_pengiriman: true,
                }
            },
            _count: {
                select: {
                    items: true // Menghitung jumlah item dalam keranjang
                }
            }
        }
    });

    const res = await ResponseData(data, authorization)
    return res
}
