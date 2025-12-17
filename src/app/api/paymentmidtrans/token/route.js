import midtransClient from 'midtrans-client'
import { ResponseData } from '@/components/api/ResponseData'

let snap = new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.SERVER_MIDSTRANS,
    // clientKey: process.env.NEXT_PUBLIC_SECREET_MIDSTRANS
})

export async function POST(req) {
    const authorization = req.headers.get('authorization')
    const { order_id,
        first_name,
        phone, kode_pos,
        email,
        address,
        item_details,
        payment } = await req.json()
    let parameter = {
        "item_details": item_details.map((data) => ({
            "id": data.id,
            "price": data.price,
            "quantity": data.quantity,
            "name": data.name,
        })),
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": item_details.map((data) => data.price * data.quantity).reduce((acc, curr) => acc + curr, 0)
        },
        "customer_details": {
            "first_name": first_name,
            "last_name": "",
            "phone": phone,
            "email": email,
            "billing_address": {
                "first_name": "PT.",
                "last_name": "Pelangi Teknik Indonesia",
                "email": "pelangiteknik@rocketmail.com",
                "phone": "081807067555",
                "address": " LTC Glodok, Lantai GF2, Blok B7. 5, Jl. Hayam Wuruk No.127, Mangga Besar, Kec. Taman Sari, Daerah Khusus Ibukota Jakarta 11180",
                "city": "Jakarta",
                "postal_code": "11180",
                "country_code": "IDN"
            },
            "shipping_address": {
                "first_name": first_name,
                "last_name": "",
                "email": email,
                "phone": phone,
                "address": address,
                "city": "Jakarta",
                "postal_code": kode_pos,
                "country_code": "IDN"
            }
        },
        // "enabled_payments": payment,
        "credit_card": {
            "save_card": true,
            "secure": true,
            "channel": "migs",
            // "bank": "bca",
            "installment": {
                "required": false,
                "terms": {
                    "bni": [3, 6, 12],
                    "mandiri": [3, 6, 12],
                    "cimb": [3],
                    "bca": [3, 6, 12],
                    "offline": [6, 12]
                }
            }
        },
        "dynamic_descriptor": {
            "merchant_name": "PT. Pelangi Teknik Indonesia",
            "city_name": "Jakarta",
            "country_code": "ID"
        }
        // "callbacks": {
        //     "finish": `${process.env.NEXT_PUBLIC_URL}/nota/` + `${order_id}`
        // }
    }

    const token = await snap.createTransaction(parameter)

    const data = await ResponseData(token, authorization)
    return data
}