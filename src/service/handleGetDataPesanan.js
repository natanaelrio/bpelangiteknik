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
export async function RetrieveDataPesanan(id) {
    try {
        const res = await fetch(`https://open-api.paper.id/api/v1/payment/request/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'client_id': `${process.env.SERVER_CLIENTID_PAPERID}`,
                'client_secret': `${process.env.SERVER_SECRETID_PAPERID}`
            },
            next: { revalidate: 0 },
        })

        return res.json()
    } catch (error) {
        console.error(error)
    }

    revalidatePath('/')
}