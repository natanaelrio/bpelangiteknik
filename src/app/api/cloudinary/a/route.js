import { v2 as cloudinary } from 'cloudinary';
import { customAlphabet } from 'nanoid'

export async function POST(req) {

    const nanoid = customAlphabet('1234567890', 9)

    try {
        // Ambil data dari request body
        const { image } = await req.json();

        // Konfigurasi cloudinary dengan kredensial dari environment variables
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET, // Pastikan variabel ini diatur di file .env
        });

        const uploadResults = [];
        const imageKeys = Object.keys(image);

        for (let i = 0; i < imageKeys.length; i++) {
            const key = imageKeys[i];

            // Jika elemen pertama (index 0), tambahkan utama: true
            const uploadData = {
                image: image[key]?.file, // Pratinjau gambar
                nameFile: image[key]?.nameFile, // Nama file
            };

            // Upload gambar ke Cloudinary
            await cloudinary.uploader.upload(uploadData?.image, {
                folder: 'articlepelangiteknik',       // Folder tempat penyimpanan di Cloudinary
                public_id: nanoid(),       // Nama file yang diunggah

            }).then((e) => uploadResults.push({ ...e, ...{ id: Number(nanoid()) } }))
        }


        // Mengembalikan hasil upload
        return Response.json({ data: uploadResults });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
    }
}