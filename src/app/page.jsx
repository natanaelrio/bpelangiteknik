import ListProduct from "@/components/listProduct";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Login from "@/components/login";

export const dynamic = 'force-dynamic'
import {
  GetListKategoriProduct,
  GetListArtikel,
  GetListKategoriArtikel,
  GetTagsArtikel,
} from "@/service/n";


export default async function Home() {

  const [dataKategori, dataArtikel, dataKategoriArtikel, dataTagsArtikel, dataFilterProduct] = await Promise.all([
    GetListKategoriProduct(),
    GetListArtikel(),
    GetListKategoriArtikel(),
    GetTagsArtikel(),
  ])

  const session = await getServerSession(authOptions)

  return (
    <>
      {session ? <ListProduct
        session={session}
        dataKategori={dataKategori?.data}
        dataArtikel={dataArtikel?.data}
        dataKategoriArtikel={dataKategoriArtikel?.data}
        dataTagsArtikel={dataTagsArtikel?.data}
      /> : <Login />}
    </>
  );
}
