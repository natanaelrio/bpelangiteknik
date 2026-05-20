import SalesPenawarkanList from '@/components/SalesPenawarkanList';
import { HandleGetUserSales } from '@/service/handleSalesPenawaran';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// const InvoiceUpdater = dynamic(() => import('@/components/InvoiceUpdater'), { ssr: false })

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sales Penawaran - Pelangi Teknik Indonesia',
  description: 'Dashboard penjualan dan pengelolaan penawaran produk dari PT Pelangi Teknik Indonesia',
  keywords: 'penjualan, offerte, produk teknik, pelangi teknik',
  openGraph: {
    title: 'Sales Penawaran - Pelangi Teknik',
    description: 'Dashboard penjualan dan pengelolaan penawaran produk',
    type: 'website',
  },
}

export default async function SalesPenawaranPage() {
    const session = await getServerSession(authOptions)

    const userSales = await HandleGetUserSales(); // Panggil fungsi untuk mendapatkan data penawaran sales

    return (
        <>
            {/* <InvoiceUpdater /> */}
            <SalesPenawarkanList userSales={userSales?.data} session={session} />
        </>
    );
}