import SalesPenawarkanList from '@/components/SalesPenawarkanList';
import { HandleGetUserSales } from '@/service/handleSalesPenawaran';

export const dynamic = 'force-dynamic'

export default async function SalesPenawaranPage() {
    const userSales = await HandleGetUserSales(); // Panggil fungsi untuk mendapatkan data penawaran sales

    return <SalesPenawarkanList userSales={userSales.data} />;
}