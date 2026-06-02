import { prisma } from "@/controllers/prisma";
import { nanoid } from "nanoid";

export async function POST(req) {
    const authorization = req.headers.get('authorization');

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
        return Response.json({
            status: 500,
            isSuccess: false,
            message: 'Unauthorized'
        });
    }

    try {
        const body = await req.json();
        const {
            id,
            salesName,
            nama,
            alamatLengkap,
            alamatKota,
            nomorHp,
            sumber,
            status,
            statusCatatan,
            crosscheck,
            fakturPajak,
            nomorInvoice,
            totalUnit,
            totalDeal,
            dpp: dppInput,
            ppn: ppnInput,
            remarks,
            remarksPajak,
            // Payment fields
            totalPayment,
            sisaPayment,
            paymentStatus,
            items,
            actorName,
            actorRole,
            oldValues, // For creating logs
            salesCompany,
            RekeningName,
            notesInvoice
        } = body;

        // Validate required fields
        if (!nama) {
            return Response.json({
                status: 400,
                isSuccess: false,
                message: 'Nama wajib diisi'
            });
        }

        // Auto-calculate DPP and PPN (hidden fields)
        // DPP = totalDeal / 1.11
        // PPN = DPP * 11%
        let calculatedDpp = dppInput ? parseFloat(dppInput) : (totalDeal ? Math.round(parseFloat(totalDeal) / 1.11) : null);
        let calculatedPpn = calculatedDpp ? Math.round(calculatedDpp * 0.11) : (ppnInput ? parseFloat(ppnInput) : null);

        // Prepare update data, filtering out undefined values
        // If status is NOT Invoice, clear payment-related fields
        const isInvoice = status === 'Invoice';

        const updateData = {
            // salesName: salesName || undefined,
            nama,
            alamatLengkap: alamatLengkap || undefined,
            alamatKota: alamatKota || undefined,
            nomorHp: nomorHp || undefined,
            sumber: sumber || undefined,
            status: status || undefined,
            statusCatatan: statusCatatan || undefined,
            crosscheck: crosscheck !== undefined ? crosscheck : undefined,
            fakturPajak: fakturPajak || undefined,
            // Clear payment fields if status is not Invoice
            nomorInvoice: isInvoice ? (nomorInvoice || undefined) : null,
            totalUnit: totalUnit ? parseFloat(totalUnit) : undefined,
            totalDeal: totalDeal ? parseFloat(totalDeal) : undefined,
            // Payment fields - clear if not Invoice
            totalPayment: isInvoice ? (totalPayment ? parseFloat(totalPayment) : undefined) : null,
            sisaPayment: isInvoice ? (sisaPayment ? parseFloat(sisaPayment) : undefined) : null,
            paymentStatus: isInvoice ? (paymentStatus || undefined) : null,
            salesCompany: salesCompany || undefined,
            RekeningName: isInvoice ? (RekeningName || undefined) : null,
            notesInvoice: isInvoice && notesInvoice ? notesInvoice : null,
            // Only update DPP and PPN if totalDeal changed or if explicitly provided
            ...(totalDeal && { dpp: calculatedDpp, ppn: calculatedPpn })
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        let result;
        const actorNameToUse = actorName || 'System';
        const actorRoleToUse = actorRole || 'ADMIN';

        if (id) {
            // UPDATE existing record
            const oldRecord = await prisma.salesProgress.findUnique({ where: { id }, include: { items: true } });

            // Check if totalDeal actually changed - if not, don't update DPP/PPN
            const totalDealChanged = oldRecord.totalDeal !== parseFloat(totalDeal);

            // Only include DPP and PPN in update if totalDeal changed
            if (totalDealChanged && totalDeal) {
                updateData.dpp = calculatedDpp;
                updateData.ppn = calculatedPpn;
            } else {
                // Remove dpp and ppn from updateData if they exist
                delete updateData.dpp;
                delete updateData.ppn;
            }

            result = await prisma.salesProgress.update({
                where: { id },
                data: updateData,
                include: {
                    items: true,
                    logs: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            });

            // Create logs for each changed field
            const changedFields = [];
            Object.keys(updateData).forEach(key => {
                if (key === 'items') return; // Skip items comparison here
                // Skip DPP/PPN logging if totalDeal hasn't changed (they're auto-calculated)
                // if ((key === 'dpp' || key === 'ppn') && !totalDealChanged) return;
                if ((key === 'dpp' || key === 'ppn')) return;

                const oldValue = oldRecord[key];
                const newValue = updateData[key];

                // Compare values properly, handling null/undefined/empty string cases
                const oldStr = oldValue === null || oldValue === undefined ? '' : String(oldValue);
                const newStr = newValue === null || newValue === undefined ? '' : String(newValue);

                if (oldStr !== newStr) {
                    changedFields.push({
                        fieldName: key,
                        oldValue: oldValue !== null && oldValue !== undefined ? String(oldValue) : null,
                        newValue: newValue !== null && newValue !== undefined ? String(newValue) : null
                    });
                }
            });

            // Compare items if provided
            if (items && Array.isArray(items)) {
                const oldItems = oldRecord.items || [];

                // Only compare items if there are any items in both old and new
                if (items.length > 0 || oldItems.length > 0) {
                    const itemsChanged = items.length !== oldItems.length || items.some((item, idx) => {
                        const oldItem = oldItems[idx];
                        if (!oldItem) return true;

                        // Compare each field, handling empty strings
                        const itemBrand = item.brand || '';
                        const itemNamaBarang = item.namaBarang || '';
                        const itemKodeBarang = item.kodeBarang || '';
                        const itemKategoriBarang = item.kategoriBarang || '';
                        const itemNote = item.note || '';

                        return itemBrand !== (oldItem.brand || '') ||
                            itemNamaBarang !== (oldItem.namaBarang || '') ||
                            itemKodeBarang !== (oldItem.kodeBarang || '') ||
                            itemKategoriBarang !== (oldItem.kategoriBarang || '') ||
                            String(item.qty || 0) !== String(oldItem.qty || 0) ||
                            String(item.hargaUnit || '') !== String(oldItem.hargaUnit || '') ||
                            String(item.subtotalUnit || '') !== String(oldItem.subtotalUnit || '') ||
                            String(item.hargaDeal || '') !== String(oldItem.hargaDeal || '') ||
                            String(item.subtotalDeal || '') !== String(oldItem.subtotalDeal || '') ||
                            itemNote !== (oldItem.note || '');
                    });

                    if (itemsChanged) {
                        changedFields.push({
                            fieldName: 'items',
                            oldValue: JSON.stringify(oldItems),
                            newValue: JSON.stringify(items),
                            note: 'Produk/Item diubah'
                        });
                    }
                }
            }

            // Only create log entries if there are actual changes
            if (changedFields.length > 0) {
                const logPromises = changedFields.map(field =>
                    prisma.salesLog.create({
                        data: {
                            id: nanoid(),
                            salesProgressId: id,
                            actorName: actorNameToUse,
                            actorRole: actorRoleToUse,
                            action: 'UPDATE_STATUS',
                            fieldName: field.fieldName,
                            oldValue: field.oldValue,
                            newValue: field.newValue,
                            note: `Changed ${field.fieldName}`
                        }
                    })
                );
                await Promise.all(logPromises);
            }

            // Handle items update if provided
            if (items && Array.isArray(items)) {
                // Delete existing items
                await prisma.salesProgressItem.deleteMany({ where: { salesProgressId: id } });

                // Create new items
                const itemPromises = items.map(item =>
                    prisma.salesProgressItem.create({
                        data: {
                            id: nanoid(),
                            salesProgressId: id,
                            brand: item.brand || undefined,
                            namaBarang: item.namaBarang || undefined,
                            kodeBarang: item.kodeBarang || undefined,
                            kategoriBarang: item.kategoriBarang || 'unit',
                            qty: item.qty ? parseInt(item.qty) : 1,
                            hargaUnit: item.hargaUnit ? parseFloat(item.hargaUnit) : undefined,
                            subtotalUnit: item.subtotalUnit ? parseFloat(item.subtotalUnit) : undefined,
                            hargaDeal: item.hargaDeal ? parseFloat(item.hargaDeal) : undefined,
                            subtotalDeal: item.subtotalDeal ? parseFloat(item.subtotalDeal) : undefined,
                            note: item.note || undefined
                        }
                    })
                );
                await Promise.all(itemPromises);
            }
        } else {
            // CREATE new record
            const newId = nanoid();
            result = await prisma.salesProgress.create({
                data: {
                    id: newId,
                    ...updateData
                },
                include: {
                    items: true,
                    logs: true
                }
            });

            // Create initial log
            await prisma.salesLog.create({
                data: {
                    id: nanoid(),
                    salesProgressId: newId,
                    actorName: actorNameToUse,
                    actorRole: actorRoleToUse,
                    action: 'CREATE',
                    note: 'Record baru dibuat oleh ' + actorNameToUse
                }
            });

            // Create items if provided
            if (items && Array.isArray(items)) {
                const itemPromises = items.map(item =>
                    prisma.salesProgressItem.create({
                        data: {
                            id: nanoid(),
                            salesProgressId: newId,
                            brand: item.brand || undefined,
                            namaBarang: item.namaBarang || undefined,
                            kodeBarang: item.kodeBarang || undefined,
                            kategoriBarang: item.kategoriBarang || 'unit',
                            qty: item.qty ? parseInt(item.qty) : 1,
                            hargaUnit: item.hargaUnit ? parseFloat(item.hargaUnit) : undefined,
                            subtotalUnit: item.subtotalUnit ? parseFloat(item.subtotalUnit) : undefined,
                            hargaDeal: item.hargaDeal ? parseFloat(item.hargaDeal) : undefined,
                            subtotalDeal: item.subtotalDeal ? parseFloat(item.subtotalDeal) : undefined,
                            note: item.note || undefined
                        }
                    })
                );
                await Promise.all(itemPromises);
            }
        }

        return Response.json({
            status: 200,
            isSuccess: true,
            message: id ? 'Data berhasil diperbarui' : 'Data berhasil dibuat',
            data: result
        });
    } catch (error) {
        console.error('Error:', error);

        // Handle unique constraint violation for nomorInvoice
        if (error.code === 'P2002' && error.meta?.target?.includes('nomorInvoice')) {
            return Response.json({
                status: 400,
                isSuccess: false,
                message: 'Nomor Invoice sudah digunakan oleh data lain. Silakan gunakan nomor invoice yang berbeda.'
            });
        }

        return Response.json({
            status: 500,
            isSuccess: false,
            message: error.message
        });
    }
}

export async function PUT(req) {
    return POST(req);
}
