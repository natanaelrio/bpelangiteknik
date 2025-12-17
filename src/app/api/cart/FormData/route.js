import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"
import { customAlphabet } from 'nanoid'

export async function POST(req) {
    const nanoid = customAlphabet('1234567890', 9)

    const { cartID,
        nama_lengkap_user,
        alamat_lengkap_user,
        alamat_detail,
        kode_pos_user,
        no_hp_user,
        catatan_pengiriman,
        province,
        city,
    } = await req.json()

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const data = await prisma.formPembelian.upsert({
            where: {
                cartID: cartID
            },
            update: {
                nama_lengkap_user,
                alamat_lengkap_user,
                alamat_detail: JSON.stringify(alamat_detail),
                kode_pos_user,
                no_hp_user,
                catatan_pengiriman,
                province,
                city,
            },
            create: {
                id: Number(nanoid()),
                cartID,
                nama_lengkap_user,
                alamat_lengkap_user,
                alamat_detail: JSON.stringify(alamat_detail),
                kode_pos_user,
                no_hp_user,
                catatan_pengiriman,
                province,
                city,
            },

        })

        const res = await ResponseData(data, authorization)
        return res
    }
    return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}