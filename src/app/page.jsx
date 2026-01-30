import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic'
import {
  GetListKategoriProduct,
  GetListArtikel,
  GetListKategoriArtikel,
  GetTagsArtikel,
} from "@/service/n";
import ListProductNew from "@/components/listProductNew";
import HeaderNew from "@/components/headerNew";
import ArtikelNew from "@/components/artikelNew";
import Login from "@/components/login";


export default async function Home() {

  const [dataKategori, dataArtikel, dataKategoriArtikel, dataTagsArtikel, dataFilterProduct] = await Promise.all([
    GetListKategoriProduct(),
    GetListArtikel(),
    GetListKategoriArtikel(),
    GetTagsArtikel(),
  ])

  console.log(dataKategori);


  const session = await getServerSession(authOptions)

  return (
    <>
      {
        session ?
          <>
            <HeaderNew session={session} />
            <ListProductNew
              session={session}
              dataKategori={dataKategori?.data}
            />
            <ArtikelNew
              session={session}
              dataArtikel={dataArtikel?.data}
              dataKategoriArtikel={dataKategoriArtikel?.data}
              dataTagsArtikel={dataTagsArtikel?.data}
            />
          </>
          : <Login />}
      {/* {session ? <ListProduct
        session={session}
        dataKategori={dataKategori?.data}
        dataArtikel={dataArtikel?.data}
        dataKategoriArtikel={dataKategoriArtikel?.data}
        dataTagsArtikel={dataTagsArtikel?.data}
      /> : <Login />} */}
    </>
  );
}
