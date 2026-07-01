import { prisma } from "@/controllers/prisma"
import { SendGroupReportPenawaran } from "@/service/handlePostPenawaran";

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
        }, include: {
            dataPesananItems: true
        }
    });

    console.log(data);

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
    const idItemsProduct = IDCart[0].items.map((item) => {
        return (
            {
                "idproduct": item.productId,
                "quantity": item.quantity
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

    // Format Rupiah
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Build message dari dataPesananItems
    const now = new Date();
    const formattedDateTime = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
    }).format(now);

    // Parse payment_info untuk total terbayar
    let paymentInfoParsed = {};
    try {
        paymentInfoParsed = JSON.parse(data?.payment_info || '{}');
    } catch (e) {
        console.log('Error parsing payment_info:', e);
    }

    const grandAmount = Number(paymentInfoParsed?.grand_amount || 0);
    const paidAmount = Number(paymentInfoParsed?.bank_transfer?.paid_amount || paymentInfoParsed?.paid_amount || 0);
    const sisaTagihan = grandAmount - paidAmount;

    // Map produk dari dataPesananItems
    const itemLines = data.dataPesananItems
        .filter(item => item.price !== null) // Filter out ongkir/kosong
        .map((item, index) => {
            const qty = item.quantity || 1;
            const harga = Number(item.price || 0);
            const subtotal = harga * qty;

            return `${index + 1}. ${item.productName || 'Unknown'}\n   Qty: ${qty} | Harga: ${formatRupiah(harga)} | Jumlah: ${formatRupiah(subtotal)}`;
        }).join('\n\n');

    const subtotal = data.dataPesananItems
        .filter(item => item.price !== null)
        .reduce((total, item) => {
            return total + (Number(item.priceOriginal || item.price || 0) * (item.quantity || 1));
        }, 0);

    const totalKeseluruhan = data.dataPesananItems
        .filter(item => item.price !== null)
        .reduce((total, item) => {
            return total + (Number(item.price || 0) * (item.quantity || 1));
        }, 0);

    // Hitung total diskon
    let totalDiskon = 0;
    let diskonType = '';
    if (data?.diskon_nominal && Number(data.diskon_nominal) > 0) {
        totalDiskon = Number(data.diskon_nominal);
        diskonType = 'nominal';
    } else if (data?.diskon && data.diskon > 0) {
        totalDiskon = data.diskon;
        diskonType = '%';
    }

    // Hitung total terbayar: subtotal - diskon
    let totalTerbayar = subtotal;
    let diskonDeskripsi = '-';
    if (totalDiskon > 0) {
        if (diskonType === 'nominal') {
            totalTerbayar = subtotal - totalDiskon;
            diskonDeskripsi = formatRupiah(totalDiskon);
        } else {
            totalTerbayar = subtotal - (subtotal * totalDiskon / 100);
            diskonDeskripsi = `${totalDiskon}%`;
        }
    }

    const kodeVoucher = data?.kode ? `\nKode Voucher: ${data.kode}` : '';

    const message = `== ${formattedDateTime} ==

*Sales Payment Confirmed* telah melakukan pembayaran

Nota: ${`https://${data?.nota_url || '-'}`}
No. Invoice: ${nota_user}
Customer: ${data?.nama_lengkap_user || '-'}
Nomor Customer: ${data?.no_hp_user || '-'}
Alamat: ${data?.alamat_lengkap_user || '-'}

*Detail Item:*
${itemLines}

*Total:*
- Subtotal: ${formatRupiah(subtotal)}
- Diskon: ${diskonDeskripsi}
- Total Terbayar: ${formatRupiah(totalTerbayar)}
${kodeVoucher}

*Status: LUNAS*
`;

    const messageRemainder = `Transaksi lewat website official minimal 10jt brand tsuzumi + googlemap customer wajib diberikan *Souvenir E-Money* dan catat di paperwork, terimakasih :)`

    const payloadReportSuratPenawaran = {
        // groupId: '120363406595440008@g.us',
        groupId: '120363021369281320@g.us',
        message: message
    }

    const payloadReportRemainder = {
        // groupId: '120363406595440008@g.us',
        groupId: '120363021369281320@g.us',
        message: messageRemainder
    }

    // Jalankan handleReport dulu, tunggu hingga selesai
    const handleReport = await SendGroupReportPenawaran(payloadReportSuratPenawaran)

    // Jalankan handleRemainder setelah handleReport selesai
    const handleRemainder = await SendGroupReportPenawaran(payloadReportRemainder)

    return { ...updateData, ...dataKu, ...idItemsProduct, ...handleReport, ...handleRemainder }
}

export async function POST(req, res) {
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };
    const { additional_info, payment_info } = await req.json()
    // const sh512 = sha512(ref_id + status_code + gross_amount + process.env.SERVER_MIDSTRANSDEMO)
    const uuid = additional_info?.invoices?.[0]?.uuid || null;

    if (true) {
        const data = await AmbilDataUsers('656f1324-9cec-4c83-ac54-832e051f09a2', payment_info)
        return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
}