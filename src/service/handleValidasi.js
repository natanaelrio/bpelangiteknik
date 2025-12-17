'use server'
export const HandleValidasi = async (slug) => {
    try {
        const resSlug = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/validasiSlug?query=${slug}`, {
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