import ListProduct from "@/components/listProduct";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Login from "@/components/login";
import { revalidatePath } from "next/cache";
import ListProductNew from "@/components/listProductNew";
import HeaderNew from "@/components/headerNew";

export const dynamic = 'force-dynamic'
export async function generateMetadata({ params, searchParams }, parent) {
    // read route params
    const { id } = await params

    return {
        title: `Hasil Pencarian Produk: ${id}`,
        description: `Menampilkan hasil pencarian produk untuk kata kunci: ${id}`,
    }
}

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

    return (
        <>
            {session ?
                <>
                    <HeaderNew session={session} />
                    <ListProductNew
                        session={session}
                        dataList={data?.data}
                        query={params?.id} />
                </>
                : <Login />}
        </>
    );
}
