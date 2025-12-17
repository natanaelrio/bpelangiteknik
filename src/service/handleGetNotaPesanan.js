'use server'
export const GetNotaPesanan = async (id) => {
    try {
        // DATA ADMIN
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/cart/notaPesanan?merchantOrderId=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            }, next: { revalidate: 0 }
        })
        return res.json()
    }
    catch (error) {
        console.log(error);
    }
    revalidatePath('/')
}