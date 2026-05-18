import { prisma } from "@/controllers/prisma";
import { ResponseData } from '@/components/api/ResponseData'

export async function POST(req) {
    const authorization = req.headers.get('authorization')

    const {
        id,
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

    console.log(id);

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const toSafeBigInt = (value) => {
            const n = Number(value);
            if (!isFinite(n)) return BigInt(0);
            return BigInt(Math.round(n));
        };

        const CreatePenawaran = await prisma.salesPenawaran.create({
            data: {
                id,
                customerName,
                PICcustomerName,
                salesName,
                salesPhone,
                selectedBank,
                notes,
                includePPN,
                totalHargaSatuan: toSafeBigInt(totalHargaSatuan),
                totalKeseluruhan: toSafeBigInt(totalKeseluruhan),
                totalQty,
                ppn: toSafeBigInt(ppn),
                grandTotal: toSafeBigInt(grandTotal),
                customerPhone: toSafeBigInt(customerPhone),
                items: {
                    create: items.map(item => ({
                        productName: item.productName,
                        qty: item.qty,
                        productPriceFinal: toSafeBigInt(item.productPriceFinal),
                        // spekNew: item.spekNew || [],
                        // kodeProduk: item.kodeProduk || null,
                        relatedProducts: (() => {
                            const productIds = item.productIds?.filter(id => id != null) ?? [];
                            return productIds.length > 0
                                ? {
                                      connect: productIds.map(id => ({
                                          id: Number(id)
                                      }))
                                  }
                                : undefined;
                        })()
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