'use server'
import { revalidatePath } from 'next/cache';

export const HandleDraf = async (slug, draf) => {
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/drafProduct`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
        },
        body: JSON.stringify({
            slugProduct: slug,
            saveDraf: draf
        }),
        next: {
            revalidate: 0
        }

    });
    revalidatePath('/')
}