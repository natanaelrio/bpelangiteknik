'use server'
import { revalidatePath } from "next/cache"

export const HandleGetDataPenawaranSales = async () => {
    try {
        const data = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/getSalesPenawaran`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            }, cache: 'no-store'
        });

        return data.json();
    }
    catch (err) {
        console.log(err);
    }
    revalidatePath('/')
}


export const HandleGetUserSales = async () => {
    try {
        const data = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/getUserSales`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            }, cache: 'no-store'
        });

        return data.json();
    }
    catch (err) {
        console.log(err);
    }
    revalidatePath('/')
}



export const HandleDeleteSalesPenawaran = async (id) => {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/del/delSalesPenawaran?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
            next: {
                revalidate: 0
            }
        })

    } catch (error) {
        console.error("Error deleting sales penawaran:", error);
    }
    revalidatePath('/')
}