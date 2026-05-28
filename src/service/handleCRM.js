'use server'
import { revalidatePath } from "next/cache"

export const SendGroupReportSales = async (payload) => {
    try {
        const response = await fetch('https://wa.pelangiteknik.com/send-group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        })

        return await response.json()
    } catch (error) {
        console.error('SendGroupReportPenawaran error:', error)
        throw error
    }
}
