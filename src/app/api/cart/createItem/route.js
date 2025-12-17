import { ResponseData } from '@/components/api/ResponseData'
import { prisma } from "@/controllers/prisma"
import { customAlphabet } from 'nanoid'
import { Response } from 'next/server'

export async function POST(req) {
    try {
        const {
            EMAIL,
            NAME,
            AVATAR,
            VOUCHER_ID,
            PRODUCT_ID,
            QUANTITY,
            CHECKLIST,
            NOTE
        } = await req.json()

        const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 12)
        const authorization = req.headers.get('authorization')

        if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
            return Response.json({
                status: 403,
                isCreated: false,
                message: 'Unauthorized access',
            })
        }

        // =======================
        // 🔍 Ambil stok produk
        // =======================
        const productData = await prisma.listProduct.findUnique({
            where: { id: PRODUCT_ID },
            select: { stockProduct: true },
        })

        if (!productData) {
            return Response.json({
                status: 404,
                isCreated: false,
                message: "Produk tidak ditemukan",
            })
        }

        const MAX_STOCK = productData.stockProduct

        // Quantity dari request dibatasi stok
        const requestQty = QUANTITY ?? 1
        const safeQty = Math.min(requestQty, MAX_STOCK)

        // =======================
        // 🔍 Cari cart existing
        // =======================
        const existingCart = await prisma.cart.findUnique({
            where: { email: EMAIL },
            include: { items: true },
        })

        // =======================
        // 🟦 Kalau cart SUDAH ADA
        // =======================
        if (existingCart) {
            const existingItem = existingCart.items.find(
                (item) => item.productId === PRODUCT_ID
            )

            if (existingItem) {
                // Quantity total = qty lama + qty baru
                const totalQty = existingItem.quantity + requestQty

                // Batasi terhadap stok
                const finalQty = totalQty > MAX_STOCK ? MAX_STOCK : totalQty

                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: finalQty,
                        checkList: CHECKLIST ?? existingItem.checkList,
                        note: NOTE ?? existingItem.note,
                    },
                })
            } else {
                // Produk baru → langsung batasi qty
                await prisma.cartItem.create({
                    data: {
                        cartId: existingCart.IDCart,
                        productId: PRODUCT_ID,
                        quantity: safeQty,
                        checkList: CHECKLIST ?? true,
                        note: NOTE ?? null,
                    },
                })
            }

            // Ambil data terbaru
            const updatedCart = await prisma.cart.findUnique({
                where: { email: EMAIL },
                include: {
                    items: { include: { product: true } },
                    voucher: true,
                },
            })

            return await ResponseData(updatedCart, authorization)
        }

        // =======================
        // 🟩 Cart BELUM ADA — BUAT BARU
        // =======================
        const newCart = await prisma.cart.create({
            data: {
                IDCart: nanoid(),
                email: EMAIL,
                name: NAME || null,
                avatar: AVATAR || null,
                ...(VOUCHER_ID && VOUCHER_ID !== 'NOVOUCHER'
                    ? { voucher: { connect: { id: VOUCHER_ID } } }
                    : {}),
                items: {
                    create: {
                        product: { connect: { id: PRODUCT_ID } },
                        quantity: safeQty, // tetap dibatasi stok
                        checkList: CHECKLIST ?? true,
                        note: NOTE ?? null,
                    },
                },
            },
            include: {
                items: { include: { product: true } },
                voucher: true,
            },
        })

        return await ResponseData(newCart, authorization)

    } catch (error) {
        console.error('❌ Error saat upsert cart:', error)
        return Response.json({
            status: 500,
            isCreated: false,
            error: error.message,
        })
    }
}
