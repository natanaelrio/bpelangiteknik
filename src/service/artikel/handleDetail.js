'use server'
export const HandleDetailArtikel = async (id) => {

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/detailArtikel?id=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
            next: {
                revalidate: 0
            }
        })
        const data = await res.json()
        return data

    } catch (error) {
        console.log(error);
    }
}