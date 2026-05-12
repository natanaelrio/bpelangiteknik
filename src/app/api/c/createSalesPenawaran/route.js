import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function POST(req) {
    const authorization = req.headers.get('authorization')

    const {
        customerName,
        customerPhone,
        PICcustomerName,
        salesName,
        salesPhone,
        selectedBank,
        notes,
        includePPN,
        totalHargaSatuan,
        totalKeseluruhan,
        totalQty,
        ppn,
        grandTotal,
        items
    } = await req.json()

    console.log(customerPhone);

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const CreatePenawaran = await prisma.salesPenawaran.create({
            data: {
                customerName,
                PICcustomerName,
                salesName,
                salesPhone,
                selectedBank,
                notes,
                includePPN,
                totalHargaSatuan: BigInt(totalHargaSatuan),
                totalKeseluruhan: BigInt(totalKeseluruhan),
                totalQty,
                ppn: BigInt(ppn),
                grandTotal: BigInt(grandTotal),
                customerPhone: BigInt(customerPhone),
                items: {
                    create: items.map(item => ({
                        productName: item.productName,
                        qty: item.qty,
                        productPriceFinal: BigInt(item.productPriceFinal),
                        spekNew: item.spekNew || []
                    }))
                }
            },
            include: {
                items: true
            }
        })

        const res = await ResponseData(CreatePenawaran, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}