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
                folder: 'ecommercepelangiteknik',       // Folder tempat penyimpanan di Cloudinary
                public_id: nanoid(),
                transformation: {
                    width: 1080,
                    height: 1080,
                    overlay: {
                        url: "https://res.cloudinary.com/dwdfn7r2r/image/upload/v1729302000/watermark/watermark_pelangiteknik.png",
                        position: {
                            x: 0,
                            y: 0,
                            gravity: 'center',
                        },
                        effects: [
                            {
                                crop: 'fill',
                                gravity: 'auto',
                                width: 600,
                                height: 600,
                            }
                        ]
                    },
                }

            }).then((e) => uploadResults.push({ ...e, ...{ id: Number(nanoid()) } }))
        }

        console.log(uploadResults);

        // Mengembalikan hasil upload
        return Response.json({ data: uploadResults });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
    }
}