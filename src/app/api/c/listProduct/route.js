import { prisma } from "@/controllers/prisma";

import { ResponseData } from '@/components/api/ResponseData'
import { customAlphabet } from 'nanoid'
import { UpsertProductToES } from "@/service/elasticSearch/updateElasticSearch";
import { log } from "console";

export async function POST(req) {
    const authorization = req.headers.get('authorization')
    const nanoid = customAlphabet('1234567890', 9)
    const id = Number(nanoid())

    const {
        username,
        slugProduct,
        productName,
        saveDraf,
        productType,
        productKategori,
        subKategoriProduct,
        tagProduct,
        descProduct,
        stockProduct,
        productPrice,
        productDiscount,
        productPriceFinal,
        urlYoutube,
        descMetaProduct,
        spekNew,
        weightProduct,
        lengthProduct,
        widthProduct,
        heightProduct,

        phase_spec,
        frequency_spec,
        gensetPower_spec,
        ratedPower_spec,
        maxPower_spec,
        ratedACVoltage_spec,
        starting_spec,
        fuelConsumption_spec,
        weight_spec,
        dimension_spec,

        fMerekDelete,
        fMerek,

        dataImage,
        imageProductUtama
    } = await req.json()


    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const FilterMerek = fMerek.split(", ")

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const CreateList = await prisma.listProduct.create({
            data: {
                id: Number(id),
                username,
                slugProduct,
                productName,
                saveDraf,
                productType,
                productKategori,
                subKategoriProduct,
                tagProduct,
                descProduct,
                stockProduct,
                productPrice,
                productDiscount,
                productPriceFinal,
                urlYoutube,
                descMetaProduct,
                spekNew,
                weightProduct,
                lengthProduct,
                widthProduct,
                heightProduct,
                fMerek: {
                    connectOrCreate: FilterMerek.map((tagName) => ({
                        where: { name: tagName },
                        create: { name: tagName },
                    })),
                },
                spec_product: {
                    create: {
                        id: Number(nanoid()),
                        phase_spec,
                        frequency_spec,
                        gensetPower_spec,
                        ratedPower_spec,
                        maxPower_spec,
                        ratedACVoltage_spec,
                        starting_spec,
                        fuelConsumption_spec,
                        weight_spec,
                        dimension_spec,
                    }
                },
                url_image_product: { create: dataImage },
                imageProductUtama: { create: imageProductUtama }
            },
            include: {
                imageProductUtama: {
                    select: { secure_url: true }
                }
            }
        })

        // AMBIL DATA FINAL
        const product = await prisma.listProduct.findUnique({
            where: { id: id },
            include: {
                imageProductUtama: { select: { secure_url: true } }
            }
        })

        // SYNC KE ELASTICSEARCH
        const upsertProductToES = await UpsertProductToES(product)
        console.log("Elasticsearch upsert result:", upsertProductToES);

        const res = await ResponseData(CreateList, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}


export async function PUT(req) {
    try {
        const authorization = req.headers.get('authorization')

        if (authorization !== process.env.NEXT_PUBLIC_SECREET) {
            return NextResponse.json({
                status: 401,
                isCreated: false,
                message: "Unauthorized"
            })
        }

        const {
            IdProduct,
            username,
            productName,
            saveDraf,
            productType,
            productKategori,
            subKategoriProduct,
            tagProduct,
            descProduct,
            stockProduct,
            productPrice,
            productDiscount,
            productPriceFinal,
            urlYoutube,
            descMetaProduct,
            spekNew,
            weightProduct,
            lengthProduct,
            widthProduct,
            heightProduct,

            phase_spec,
            frequency_spec,
            gensetPower_spec,
            ratedPower_spec,
            maxPower_spec,
            ratedACVoltage_spec,
            starting_spec,
            fuelConsumption_spec,
            weight_spec,
            dimension_spec,

            fMerek,
            fMerekDelete,

            dataImage,
            imageProductUtama
        } = await req.json()

        const FilterMerek = fMerek ? fMerek.split(", ") : []
        const FilterMerekDelete = fMerekDelete ? fMerekDelete.split(", ") : []

        const trxResult = await prisma.$transaction(async (tx) => {

            // UPDATE PRODUCT
            const updateProduct = await tx.listProduct.update({
                where: { id: IdProduct },
                data: {
                    updateDate: new Date(),
                    username,
                    productName,
                    saveDraf,
                    productType,
                    productKategori,
                    subKategoriProduct,
                    tagProduct,
                    descProduct,
                    stockProduct,
                    productPrice,
                    productDiscount,
                    productPriceFinal,
                    urlYoutube,
                    descMetaProduct,
                    spekNew,
                    weightProduct,
                    lengthProduct,
                    widthProduct,
                    heightProduct,
                    fMerek: {
                        disconnect: FilterMerekDelete.map((name) => ({ name })),
                        connectOrCreate: FilterMerek.map((name) => ({
                            where: { name },
                            create: { name }
                        }))
                    }
                }
            })

            // UPDATE SPEC
            const updateSpec = await tx.specProduct.updateMany({
                where: { IdProduct },
                data: {
                    phase_spec,
                    frequency_spec,
                    gensetPower_spec,
                    ratedPower_spec,
                    maxPower_spec,
                    ratedACVoltage_spec,
                    starting_spec,
                    fuelConsumption_spec,
                    weight_spec,
                    dimension_spec
                }
            })

            // INSERT IMAGE UTAMA
            if (imageProductUtama) {
                await tx.imageProductUtama.create({
                    data: { ...imageProductUtama, IdProduct }
                })
            }

            // INSERT IMAGE LIST
            if (Array.isArray(dataImage) && dataImage.length > 0) {
                for (const img of dataImage) {
                    await tx.imageProduct.create({
                        data: { ...img, IdProduct }
                    })
                }
            }

            return { updateProduct, updateSpec }
        })

        // AMBIL DATA FINAL
        const product = await prisma.listProduct.findUnique({
            where: { id: IdProduct },
            include: {
                imageProductUtama: { select: { secure_url: true } }
            }
        })

        // SYNC KE ELASTICSEARCH
        const upsertProductToES = await UpsertProductToES(product)
        console.log("Elasticsearch upsert result:", upsertProductToES);

        return ResponseData({
            status: true,
            trxResult,
            product
        }, authorization)

    } catch (error) {
        console.error("PUT PRODUCT ERROR:", error)

        return NextResponse.json({
            status: 500,
            isCreated: false,
            error: error.message
        })
    }
}


export async function DELETE(req) {
    const authorization = req.headers.get('authorization')

    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    const {
        public_id, kondisiImageUtama, kondisiListImage, id
    } = await req.json()


    if (authorization == process.env.NEXT_PUBLIC_SECREET) {

        kondisiImageUtama && await prisma.imageProductUtama.delete({
            where: {
                id
            },
        })
        kondisiListImage && await prisma.imageProduct.delete({
            where: {
                public_id
            },
        })
        return Response.json({ status: 'ok' })
        // return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

}