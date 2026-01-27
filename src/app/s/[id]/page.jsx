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

export default async function Home({ params }) {
    const session = await getServerSession(authOptions)

    return (
        <>
            {session ?
                <>
                    <HeaderNew session={session} />
                    <ListProductNew
                        session={session}
                        query={params?.id} />
                </>
                : <Login />}
        </>
    );
}
