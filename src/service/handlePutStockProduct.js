'use server'
import { revalidatePath } from "next/cache"
export async function UpdateStockProduct(dataKu) {
    try {
        // DATA ADMIN
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/putStock`, {
            method: 'PUT',
            body: JSON.stringify(dataKu),
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