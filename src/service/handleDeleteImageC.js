'use server'
import { v2 as cloudinary } from 'cloudinary'

export const HandleDeleteImageC = async (id) => {
    try {
        const data = await cloudinary.api.delete_resources(id,
            { type: 'upload', resource_type: 'image' })

        return data
    } catch (error) {
        console.log(error);
    }
}