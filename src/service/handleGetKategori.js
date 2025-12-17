'use server'
export const HandleGetKategori = async () => {
    try {
        const resSlug = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/getKategoriProduct`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
        });

        return resSlug.json();
    }
    catch (err) {
        console.log(err);
    }
}