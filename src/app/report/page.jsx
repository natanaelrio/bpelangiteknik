import SalesProgressReport from '@/components/SalesProgressReport';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Login from "@/components/login";

export const dynamic = 'force-dynamic'
export const metadata = {
    title: 'Laporan Sales Progress - Pelangi Teknik Indonesia',
    description: 'Laporan perkembangan penjualan dan penawaran produk dari PT Pelangi Teknik Indonesia',
    keywords: 'laporan penjualan, perkembangan sales, pelangi teknik',
    openGraph: {
        title: 'Laporan Sales Progress - Pelangi Teknik',
        description: 'Laporan perkembangan penjualan dan penawaran produk',
    },
};

export default async function ReportPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return <Login />;
    }

    return <SalesProgressReport session={session} />;
}
