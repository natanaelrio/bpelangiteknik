'use server'
import { revalidatePath } from 'next/cache';

export const HandlePostCategoryUtama = async (data) => {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/createKategoriUtama`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
            body: JSON.stringify(data),
            next: {
                revalidate: 0
            }

        });
    }
    catch (err) {
        console.log(err);
    }
    revalidatePath('/')
}