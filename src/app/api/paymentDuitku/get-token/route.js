import CryptoJS from 'crypto-js';
import getJakartaUnixTimestamp from '@/utils/getJakartaUnixTimestamp';
import { ResponseData } from '@/components/api/ResponseData';

export async function POST(req) {
    const authorization = req.headers.get('authorization')
    const {
        kodeBank,
        postalCode,
        address,
        city,
        note,
        merchantOrderId,
        customerVaName,
        phoneNumber,
        itemDetails,
        email } = await req.json()

    const Timestamps = getJakartaUnixTimestamp()
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-duitku-signature': CryptoJS.SHA256(process.env.SERVER_KODEMC + Timestamps + process.env.SERVER_KEYDUITKU).toString(CryptoJS.enc.Hex),
        'x-duitku-timestamp': Timestamps,
        'x-duitku-merchantcode': process.env.SERVER_KODEMC
    };

    const bodynya = {
        "paymentAmount": itemDetails.map((data) => data.price).reduce((acc, curr) => acc + curr, 0),
        "merchantOrderId": merchantOrderId,
        "productDetails": note ? note : 'tidak ada catatan',
        "additionalParam": "",
        "merchantUserInfo": "",
        "customerVaName": customerVaName,
        "email": email,
        "phoneNumber": phoneNumber,
        "itemDetails": itemDetails,
        "customerDetail": {
            "firstName": customerVaName,
            "lastName": customerVaName,
            "email": email,
            "phoneNumber": phoneNumber,
            "billingAddress": {
                "firstName": customerVaName,
                "lastName": customerVaName,
                "address": address,
                "city": city,
                "postalCode": postalCode,
                "phone": phoneNumber,
                "countryCode": "ID"
            },
            "shippingAddress": {
                "firstName": "Pelangi",
                "lastName": "Teknik",
                "address": "Pergudangan Kav. Dpr, Jl. Kp. Noroktog No.94 Blok C, RT.004/RW.004, Nerogtog, Cipondoh, Tangerang City, Banten 15145",
                "city": "Tangerang",
                "postalCode": "15145",
                "phone": "08176424276",
                "countryCode": "ID"
            }
        },
        "callbackUrl": `${process.env.NEXT_PUBLIC_URL2}/api/paymentDuitku`,
        "returnUrl": `${process.env.NEXT_PUBLIC_URL2}`,
        "expiryPeriod": 10,
        "paymentMethod": kodeBank
    }

    const resDuitku = await fetch(process.env.NEXT_PUBLIC_POSTDUITKU, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodynya)
    })

    const data = await resDuitku.json()
    const res = await ResponseData(data, authorization)
    return res
}