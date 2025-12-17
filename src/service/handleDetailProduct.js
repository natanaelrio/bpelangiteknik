'use server'
export const handleDetailProduct = async (id) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get/product?id=${id}`, {
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