

'use server'
import { v2 as cloudinary } from 'cloudinary'

export const HandleUploadImageC = async (id) => {
    try {
        const data = await cloudinary.uploader
            .upload(id, {
                folder: 'pelangiteknik',
                resource_type: 'image'
            })
            .then(console.log);

        return data
    } catch (error) {
        console.log(error);
    }
}