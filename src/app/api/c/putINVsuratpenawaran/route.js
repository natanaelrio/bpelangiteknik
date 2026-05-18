import { prisma } from '@/controllers/prisma';
import { ResponseData } from '@/components/api/ResponseData';

export async function PUT(req) {
    const authorization = req.headers.get('authorization');

    try {
        const { id, invoiceNumber } = await req.json();

        BigInt.prototype.toJSON = function () {
            return this.toString();
        };

        if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
            return new Response(JSON.stringify({ isCreated: false, contact: 'natanael rio wijaya 08971041460' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!id) {
            return new Response(JSON.stringify({ isCreated: false, message: 'Missing id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update invoiceNumber
        const updated = await prisma.salesPenawaran.update({
            where: { id },
            data: {
                invoiceNumber: invoiceNumber || null
            }
        });

        const res = await ResponseData(updated, authorization);
        return res;

    } catch (err) {
        console.error('PUT putINVsuratpenawaran error:', err);
        return new Response(JSON.stringify({ isCreated: false, message: err.message || 'Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
