'use server'
import { revalidatePath } from "next/cache"
export async function GetDataPesanan(month, year, payment) {
    try {
        // DATA ADMIN
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/DataPesanan?month=${month}&year=${year}&payment=${payment}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            }, next: { revalidate: 0 }
        })
        return res.json()
    }

    catch (error) {
        console.log(error);
    }
    revalidatePath('/')
}
export async function DeleteDataPesanan(id) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/DataPesanan`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET,
            },
            body: JSON.stringify({
                id
            }),
            next: { revalidate: 0 },
        })

        return res.json()
    } catch (error) {
        console.error(error)
    }

    revalidatePath('/')
}