'use server'
import { revalidatePath } from 'next/cache';

export const HandleDrafArtikel = async (slug, draf) => {

    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/drafArtikel`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
        },
        body: JSON.stringify({
            slug: slug,
            saveDraf: draf
        }),
        next: {
            revalidate: 0
        }

    });
    revalidatePath('/')
}