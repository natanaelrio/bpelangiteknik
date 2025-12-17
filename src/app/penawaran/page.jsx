import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Login from "@/components/login";
import FormPenawaran from "@/components/formPenawaran";

export const dynamic = 'force-dynamic'

export async function GetListProduct() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/suratPernawaran`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
            next: {
                revalidate: 0
            }
        })
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error);
    }
}

export default async function Home() {
    const data = await GetListProduct()
    const session = await getServerSession(authOptions)

    return (
        <>
            {session ? <FormPenawaran data={data?.data} /> : <Login />}
        </>
    );
}
