'use server'
import { revalidatePath } from 'next/cache';

export const GetFilterProduct = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/p/filter`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
            cache: 'no-store'
        });
        const data = await res.json()
        return data.data
    }
    catch (err) {
        console.log(err);
    }
    revalidatePath('/')
}

export const GetListProduct = async (page, take, m, search) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/listProduct?page=${page ? page : 1}&take=${take}&m=${m ? m : 'undefined'}&search=${search}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
            cache: 'no-store'
        });
        const data = await res.json()
        return data
    }
    catch (err) {
        console.log(err);
    }
    revalidatePath('/')
}

export const GetProduct = async (id) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/p/product?id=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
            next: {
                revalidate: 0
            }
        });
        const data = await res.json()
        return data.data
    }
    catch (err) {
        console.log(err);
    }
    revalidatePath('/')
}


export async function GetListKategoriProduct() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/getKategoriProduct`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            }
        })
        return res.json()

    } catch (error) {
        console.log(error);
    }
    revalidatePath('/')
}

export async function GetListArtikel() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/listArtikel`, {
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
    revalidatePath('/')
}

export async function GetListKategoriArtikel() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/kategori`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            }
        })
        return res.json()

    } catch (error) {
        console.log(error);
    }
    revalidatePath('/')
}

export async function GetTagsArtikel() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/tagArtikel`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            }
        })
        return res.json()

    } catch (error) {
        console.log(error);
    }
    revalidatePath('/')
}


export const GetFMerek = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/fMerek`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            }
        });
        const data = await res.json()
        return data
    }
    catch (err) {
        console.log(err);
    }
    revalidatePath('/')
}