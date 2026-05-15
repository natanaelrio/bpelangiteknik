import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        // validasi wajib
        if (
            !body.customerName ||
            !body.customerPhone ||
            !body.salesName
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Data tidak lengkap'
                },
                { status: 400 }
            );
        }

        console.log(body.items);

        // format item biar readable di sheet
        const formattedItems = body.items
            ?.map((item, index) =>
                `${index + 1}. ${item.productName || item.title}
PPN: ${item.includePPN ? 'Ya' : 'Tidak'}
Qty: ${item.qty || 1}
Harga: ${item.productPriceFinal || 0}
Subtotal: ${item.subtotal || 0}
PPN: ${item.ppn || 0}
Grand Total: ${item.grandTotal || 0}`
            )
            .join('\n\n');

        const formattedNotes = Array.isArray(body.notes)
            ? body.notes
                .map((note, i) => `${i + 1}. ${note}`)
                .join('\n')
            : body.notes || '-';

        // payload final ke sheet
        const sheetData = {
            tanggal: `${new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })} WIB`,

            customerName: body.customerName,
            customerPhone: body.customerPhone,
            PICcustomerName: body.PICcustomerName,

            salesName: body.salesName,
            salesPhone: body.salesPhone,

            selectedBank: body.selectedBank,
            notes: formattedNotes,

            includePPN: body.includePPN ? 'Ya' : 'Tidak',

            totalHargaSatuan: body.totalHargaSatuan,
            totalKeseluruhan: body.totalKeseluruhan,
            totalQty: body.totalQty,
            ppn: body.ppn,
            grandTotal: body.grandTotal,

            items: formattedItems,

            // status: 'Baru'
        };


        const response = await fetch(
            process.env.GOOGLE_SHEETS_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sheetData)
            }
        );

        if (!response.ok) {
            throw new Error(
                'Failed send to Google Sheets'
            );
        }

        return NextResponse.json({
            success: true,
            message:
                'Penawaran berhasil disimpan',
            data: sheetData
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    'Terjadi kesalahan sistem'
            },
            { status: 500 }
        );
    }
}