import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ListPesanan from "@/components/listPesanan";
import { GetDataPesanan } from "@/service/handleGetDataPesanan";
import Login from "@/components/login";

export default async function Page({ params, searchParams }) {
    const now = new Date()

    const month = Number(searchParams.month) || now.getMonth() + 1
    const year = Number(searchParams.year) || now.getFullYear()
    const payment = searchParams.payment || null
    const session = await getServerSession(authOptions)
    const data = await GetDataPesanan(month, year, payment)

    return (session ? <ListPesanan
        month={month}
        year={year}
        payment={payment}
        data={data}
        session={session} /> : <Login />)
}
