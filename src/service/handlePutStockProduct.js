export const dynamic = 'force-dynamic'
export async function UpdateStockProduct(dataKu) {
    try {

        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids: {
                    product: `product:${dataKu.slugProduct}`,
                    listProduct: 'data:productList'
                }
            }),
        })
        // DATA ADMIN
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/putStock`, {
            method: 'PUT',
            body: JSON.stringify(dataKu),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            }, cache: 'no-store'
        })
        return res.json()
    }

    catch (error) {
        console.log(error);
    }
    revalidatePath('/')
}