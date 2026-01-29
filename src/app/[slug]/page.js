import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    GetListKategoriProduct,
} from "@/service/n";
import { handleDetailProduct } from "@/service/handleDetailProduct";
import FormInput from "@/components/FormInput";
import Login from "@/components/login";
import HeaderNew from "@/components/headerNew";

export default async function Home({ params }) {

    const [dataKategori, dataProductDetail] = await Promise.all([
        GetListKategoriProduct(),
        handleDetailProduct(params.slug)
    ])

    const session = await getServerSession(authOptions)

    if (!session) {
        return <Login />
    }

    return (
        <>
            <HeaderNew session={session} />
            {dataProductDetail.data[0] ?
                <FormInput
                    session={session}
                    kondisi={true}
                    data={dataProductDetail.data[0]}
                    text={'Update Product'}
                    dataKategori={dataKategori} /> :
                <div>ga adaaaa</div>
            }
        </>
    )
}
