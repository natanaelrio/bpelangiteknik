import ListProduct from "@/components/listProduct";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Login from "@/components/login";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic'

export async function GetListProduct(id) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/searchListProduct?query=${id}`, {
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
    revalidatePath('/')
}

export default async function Home({ params }) {
    const data = await GetListProduct(params?.id)
    const session = await getServerSession(authOptions)
    console.log();

    return (
        <>
            {session ?
                <ListProduct dataList={data?.data} query={params?.id} />
                : <Login />}
        </>
    );
}
