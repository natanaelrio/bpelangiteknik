import { getCurrentDateFormatted, formatRupiah, calculateTax, calculateSubtotals } from './utils';

// Build WhatsApp message from form data
export const buildWhatsAppMessage = (formData, userName, perusahaan) => {
    const itemsList = formData.items?.map((item, idx) => {
        return `${idx + 1}. ${item.brand || '-'} - ${item.namaBarang || '-'} (${item.kategoriBarang === 'sparepart' ? 'Sparepart' : 'Unit'})
   Qty: ${item.qty || 0} | Harga OCT: Rp ${parseFloat(item.hargaUnit || 0).toLocaleString('id-ID')} | Harga Deal: Rp ${parseFloat(item.hargaDeal || 0).toLocaleString('id-ID')}`;
    }).join('\n\n');

    const { totalUnit, totalDeal } = calculateSubtotals(formData.items);
    const { dpp, ppn } = calculateTax(totalDeal);

    let message = `📊 *LAPORAN SALES PROGRESS*

🏢 *Perusahaan:* ${perusahaan}
👤 *Sales:* ${userName}
📅 *Tanggal:* ${getCurrentDateFormatted()}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *DATA CUSTOMER*
• *Nama:* ${formData.nama || '-'}
• *No. HP:* ${formData.nomorHp || '-'}
• *Kota:* ${formData.alamatKota || '-'}
• *Alamat:* ${formData.alamatLengkap || '-'}
• *Sumber:* ${formData.sumber || '-'}

📌 *STATUS*
• *Status:* ${formData.status || '-'}
• *Catatan:* ${formData.statusCatatan || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━

🛒 *DAFTAR PRODUK*
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *TOTAL*
• Total Unit (OCT): Rp ${totalUnit.toLocaleString('id-ID')}
• Total Deal: Rp ${totalDeal.toLocaleString('id-ID')}
• DPP: Rp ${dpp.toLocaleString('id-ID')}
• PPN: Rp ${ppn.toLocaleString('id-ID')}`;

    // Add payment info if Invoice
    if (formData.status === 'Invoice') {
        message += `

💳 *PEMBAYARAN*
• Status: ${formData.paymentStatus || '-'}
• Invoice: ${formData.nomorInvoice || '-'}
• Rekening: ${formData.RekeningName || '-'}
• Total Bayar: Rp ${parseFloat(formData.totalPayment || 0).toLocaleString('id-ID')}
• Sisa Bayar: Rp ${parseFloat(formData.sisaPayment || 0).toLocaleString('id-ID')}`;
    }

    message += `

━━━━━━━━━━━━━━━━━━━━━━━━━━
_Dikirim dari Sales Progress Report_`;

    return message;
};

// Build payload for WhatsApp
export const buildWhatsAppPayload = (formData, userName, perusahaan, userRole) => {
    const isSPV = userRole === 'SPV';
    const groupId = isSPV ? '120363406595440008@g.us' : '120363411343925143@g.us';
    
    return {
        groupId,
        message: buildWhatsAppMessage(formData, userName, perusahaan)
    };
};
