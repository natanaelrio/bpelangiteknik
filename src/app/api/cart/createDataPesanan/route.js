import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"
import { customAlphabet } from 'nanoid'

export async function POST(req) {
    const { id, fromItems } = await req.json()
    const nanoid = customAlphabet('1234567890', 9)

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const authorization = req.headers.get('authorization')
    const data = await prisma.dataPesanan.create({
        data: {
            id: Number(nanoid()),
            merchantOrderId: id.merchantOrderId,
            reference: id.reference,
            cartID: id.cartID,
            nama_lengkap_user: id.nama_lengkap_user,
            alamat_lengkap_user: id.alamat_lengkap_user,
            alamat_detail: id.alamat_detail,
            kode_pos_user: id.kode_pos_user,
            no_hp_user: id.no_hp_user,
            catatan_pengiriman: id.catatan_pengiriman,
            kode: id.kode,
            diskon: id.diskon,
            diskon_nominal: id.diskon_nominal,
            nota_url: id.nota_url,
            dataPesananItems: { create: fromItems }
        },
    });


    const res = await ResponseData(data, authorization)
    return res
}