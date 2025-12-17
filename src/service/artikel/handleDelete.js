'use server'
import { revalidatePath } from 'next/cache';

export const HandleDeleteArtikel = async (id) => {

    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/deleteArtikel`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
        },
        body: JSON.stringify({
            id: id
        }),
        next: {
            revalidate: 0
        }

    });
    revalidatePath('/')
}