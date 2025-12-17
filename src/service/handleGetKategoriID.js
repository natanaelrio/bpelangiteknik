'use server'
export const HandleGetKategoriID = async (id) => {
    try {
        const resSlug = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/getKategoriID?query=${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
            cache: 'no-store'
        });

        return resSlug.json();
    }
    catch (err) {
        console.log(err);
    }
}