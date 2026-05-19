'use server'

export const CreateSalesPenawaran = async (payload) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/createSalesPenawaran`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        })

        return await response.json()
    } catch (error) {
        console.error('CreateSalesPenawaran error:', error)
        throw error
    }
}

export const CreateSheetGoogleSalesPenawaran = async (payload) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/createSheetGoogleSalesPenawaran`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        })

        return await response.json()
    } catch (error) {
        console.error('CreateSheetGoogleSalesPenawaran error:', error)
        throw error
    }
}

export const SendGroupReportPenawaran = async (payload) => {
    try {
        const response = await fetch('https://wa.pelangiteknik.com/send-group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        })

        return await response.json()
    } catch (error) {
        console.error('SendGroupReportPenawaran error:', error)
        throw error
    }
}
