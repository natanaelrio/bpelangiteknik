import FormInputArtikel from "@/components/FormInputArtikel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Login from "@/components/login";

export const dynamic = 'force-dynamic'

export async function GetListKategoriArtikel() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/kategori`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
      },
      next: {
        revalidate: 0
      }
    })
    return res.json()

  } catch (error) {
    console.log(error);
  }
}

export async function GetTagsArtikel() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/tagArtikel`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
      },
      next: {
        revalidate: 0
      }
    })
    return res.json()

  } catch (error) {
    console.log(error);
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  const dataKategori = await GetListKategoriArtikel()
  const dataTagsArtikel = await GetTagsArtikel()

  return (
    <>
      {session ? <FormInputArtikel
        dataKategori={dataKategori?.data}
        dataTagsArtikel={dataTagsArtikel?.data}
      /> : <Login />}
    </>
  );
}
