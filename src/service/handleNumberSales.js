'use server'
export const HandleGetNumberSales = async () => {
    try {
        const data = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/sales`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
            },
        });

        return data.json();
    }
    catch (err) {
        console.log(err);
    }
}