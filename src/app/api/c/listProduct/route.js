import { prisma } from "@/controllers/prisma";

import { ResponseData } from '@/components/api/ResponseData'
import { customAlphabet } from 'nanoid'

export async function POST(req) {
    const authorization = req.headers.get('authorization')
    const nanoid = customAlphabet('1234567890', 9)

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
                id: Number(nanoid()),
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
            }
        })
        const res = await ResponseData(CreateList, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })
}

export async function PUT(req) {
    const authorization = req.headers.get('authorization')

    const { IdProduct,
        // slugProduct,
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
        imageProductUtama,

    } = await req.json()

    const FilterMerek = fMerek.split(", ")
    const FilterMerekDelete = fMerekDelete.split(", ")

    if (authorization == process.env.NEXT_PUBLIC_SECREET) {
        const UpdateList = await prisma.listProduct.update({
            where: { id: IdProduct },
            data: {
                // slugProduct,
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
                    disconnect: FilterMerekDelete.map((tagName) => ({
                        name: tagName, // Memutus hubungan berdasarkan nama tag
                    })),
                    connectOrCreate: FilterMerek.map((tagName) => ({
                        where: { name: tagName },
                        create: { name: tagName },
                    })),
                },
            }
        })

        const UpdateListSpec = await prisma.specProduct.updateMany({
            where: { id: IdProduct },
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

        // LIST GAMBAR UTAMA
        imageProductUtama && await prisma.imageProductUtama.create({
            data: { ...imageProductUtama, IdProduct: IdProduct }
        })

        //LIST GAMBAR
        for (const image of dataImage) {
            dataImage && await prisma.imageProduct.create({
                data: { ...image, IdProduct: IdProduct }
            })
        }


        const data = await prisma.$transaction([UpdateList, UpdateListSpec])
        const res = await ResponseData(data, authorization)
        return res
    } else return Response.json({ status: 500, isCreated: false, contact: 'natanael rio wijaya 08971041460' })

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