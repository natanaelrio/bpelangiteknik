'use client'
import { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from '@/components/formInput.module.css'
import { ContentState, convertFromHTML, convertToRaw, EditorState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";
import draftToHtml from "draftjs-to-html";
import { useRouter } from 'next/navigation';
import { MdOutlineFileUpload } from "react-icons/md";
import Image from 'next/image';
import { HandleDeleteImageC } from '@/service/handleDeleteImageC';
import { useCon } from '@/zustand/useCon';
import toast from 'react-hot-toast';
import { usePathname } from 'next/navigation'
import Link from 'next/link';
import { HandleValidasi } from '@/service/handleValidasi';
import Logout from './logout';
import { HandlePostCategory } from '@/service/handlePostCategory';
import LottieAnimation from '@/utils/LottieAnimation';
import { GetFMerek } from '@/service/n';
import { HandlePostCategoryUtama } from '@/service/handlePostCategoryUtama';
import { HandleGetKategoriUtama } from '@/service/handleGetKategoriUtama';
import { HandleGetKategoriID } from '@/service/handleGetKategoriID';

export default function FormInput({ data, text, kondisi, session }) {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const segment = pathname.split("/")[1]

    const setLayang = useCon((state) => state.setLayang)

    const [images, setImages] = useState([
        {
            preview: data?.imageProductUtama ? data?.imageProductUtama?.secure_url : null,
            nameFile: '',
            file: null,
            public_id: data?.imageProductUtama?.public_id ? data?.imageProductUtama?.public_id : null,
            kondisi: false,
            id: data?.imageProductUtama?.id
        },
        {
            preview: data?.url_image_product[0] ? data?.url_image_product[0]?.secure_url : null,
            nameFile: '',
            file: null,
            public_id: data?.url_image_product[0]?.public_id ? data?.url_image_product[0]?.public_id : null,
            kondisi: false
        },
        {
            preview: data?.url_image_product[1] ? data?.url_image_product[1]?.secure_url : null,
            nameFile: '',
            file: null,
            public_id: data?.url_image_product[1]?.public_id ? data?.url_image_product[1]?.public_id : null,
            kondisi: false
        },
        {
            preview: data?.url_image_product[2] ? data?.url_image_product[2]?.secure_url : null,
            nameFile: '',
            file: null,
            public_id: data?.url_image_product[2]?.public_id ? data?.url_image_product[2]?.public_id : null,
            kondisi: false
        },
        {
            preview: data?.url_image_product[3] ? data?.url_image_product[3]?.secure_url : null,
            nameFile: '',
            file: null,
            public_id: data?.url_image_product[3]?.public_id ? data?.url_image_product[3]?.public_id : null,
            kondisi: false
        },
        {
            preview: data?.url_image_product[4] ? data?.url_image_product[4]?.secure_url : null,
            nameFile: '',
            file: null,
            public_id: data?.url_image_product[4]?.public_id ? data?.url_image_product[4]?.public_id : null,
            kondisi: false
        },
        {
            preview: data?.url_image_product[5] ? data?.url_image_product[5]?.secure_url : null,
            nameFile: '',
            file: null,
            public_id: data?.url_image_product[5]?.public_id ? data?.url_image_product[5]?.public_id : null,
            kondisi: false
        }
    ]);

    // Separate ImageUtama from the rest
    const ImageUtama = [images[0]]; // Main image is the first one
    const ImageList = images.slice(1); // The rest of the images

    const DataImageList = ImageList.filter((Image) => Image.file != null);
    const DataImageUtama = ImageUtama.filter((Image) => Image.file != null);

    const [selectPubListImage, setSelectPubListImage] = useState([]);
    const [selectPubImageUtama, setSelectPubImageUtama] = useState([]);
    const [selectIDUtama, setselectIDUtama] = useState(null);

    // Function to handle image change and preview generation
    const handleImageChange = (event, imageIndex) => {
        const file = event.target.files[0];

        if (file.size > 10000 * 1024) { // 10MB in bytes
            setImages((prevImages) => {
                const updatedImages = [...prevImages];
                updatedImages[imageIndex].kondisi = true;
                return updatedImages;
            });
            return;
        }

        const nameFile = file.lastModified + file.name;
        const nameFileRex = nameFile.replace(/[^a-zA-Z0-9]/g, '');

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Read image as DataURL
            reader.onloadend = () => {
                setImages((prevImages) => {
                    const updatedImages = [...prevImages];
                    updatedImages[imageIndex] = {
                        preview: reader.result,
                        nameFile: nameFileRex,
                        file: reader.result,
                        kondisi: false
                    };
                    return updatedImages;
                });
            };
        }
    };

    const handleDelete = (imageIndex) => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus gambar ini?");
        if (confirmDelete) {
            setImages((prevImages) => {
                const updatedImages = [...prevImages];
                updatedImages[imageIndex] = { preview: null, nameFile: '', file: null, kondisi: false };
                return updatedImages;
            });
        }
    };

    const handleDeleteLocal = (e, imageIndex) => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus gambar ini?");
        if (confirmDelete) {
            setSelectPubListImage([...selectPubListImage, e])
            setImages((prevImages) => {
                const updatedImages = [...prevImages];
                updatedImages[imageIndex] = { preview: null, nameFile: '', file: null, kondisi: false };
                return updatedImages;
            });
        }
    }
    const handleDeleteLocalUtama = (e, imageIndex, idUtama) => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus gambar ini?");
        if (confirmDelete) {
            setselectIDUtama(idUtama)
            setSelectPubImageUtama([e])
            setImages((prevImages) => {
                const updatedImages = [...prevImages];
                updatedImages[imageIndex] = { preview: null, nameFile: '', file: null, kondisi: false };
                return updatedImages;
            });
        }
    }

    const [selectedMerek, setSelectedMerek] = useState(data ? data?.fMerek?.map((e) => {
        return e?.name
    }) : [])

    const [selectedMerekDelete, setSelectedMerekDelete] = useState([])

    const handleFMerek = (merek) => {
        setSelectedMerek((prevMerek) => {
            if (!prevMerek.includes(merek)) {
                // Kondisi tidak cek (menambahkan merek ke daftar selectedMerek)
                console.log(`merek belum dipilih, menambahkan: ${merek}`);

                // Saat merek ditambahkan ke selectedMerek, hapus dari selectedMerekDelete
                setSelectedMerekDelete((prevDeletedMerek) => prevDeletedMerek.filter((t) => t !== merek));

                return [...prevMerek, merek];
            } else {
                // Kondisi cek (menghapus merek dari daftar selectedMerek)
                console.log(`merek sudah dipilih, menghapus: ${merek}`);

                // Saat merek dihapus dari selectedMerek, tambahkan ke selectedMerekDelete
                setSelectedMerekDelete((prevDeletedMerek) =>
                    prevDeletedMerek.includes(merek) ? prevDeletedMerek : [...prevDeletedMerek, merek]
                );

                return prevMerek.filter((t) => t !== merek);
            }
        });
    };

    const [draf, setDraf] = useState(null)

    // TEXT EDITOR
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const onEditorStateChange = (editorState) => {
        // formik.setFieldValue('myFile', e.target.files[0]);
        setEditorState(editorState)
    };


    const [mereks, setMereks] = useState([])
    useEffect(() => {
        const edit = () => {
            const contentBlock = htmlToDraft(data?.descProduct);
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setEditorState(editorState)
        }
        data && edit()

        const fetchMerek = async () => {
            const res = await GetFMerek()
            setMereks(res?.data)
        }
        fetchMerek()

    }, [data, data?.descProduct])


    // const ResetDeskripsi = () => {
    //     const blocksFromHTML = convertFromHTML('&nbsp;')
    //     const state = ContentState.createFromBlockArray(
    //         blocksFromHTML.contentBlocks,
    //         blocksFromHTML.entityMap,
    //     )
    //     setEditorState(EditorState.createWithContent(state))
    // }

    // console.log(dataKategoriUtama.data);


    const [loadingKategoriUtama, setLoadingKategoriUtama] = useState(false);
    const [loadingKategori, setLoadingKategori] = useState(false);

    const [dataKategoriUtama, setDataKategoriUtama] = useState([])
    const [kategoriUtamaID, setKategoriUtamaID] = useState('')
    const [kategoriUtamaIDfalse, setKategoriUtamaIDfalse] = useState(true)
    useEffect(() => {
        const IDKategori = async () => {
            const res = await HandleGetKategoriID(data?.productKategori)
            setKategoriUtamaID(res.data[0].categoryProductUtamaId)
        }
        pathname == '/' && kategoriUtamaIDfalse && IDKategori()
        segment == 's' && kategoriUtamaIDfalse && IDKategori()

        const fetchData = async () => {
            setLoading(true)
            const res = await HandleGetKategoriUtama(kategoriUtamaID)
            setDataKategoriUtama(res?.data)
            setLoading(false)
        }
        fetchData()
    }, [kategoriUtamaID, loadingKategoriUtama, loadingKategori])

    const dataSubKategori = dataKategoriUtama?.filter(item => item?.categoryProduct?.length > 0)[0]?.categoryProduct;
    const [notSubKategori, setNotSubKategori] = useState(dataSubKategori?.length ? dataSubKategori?.length : false)

    const [kategoriUtama, setKategoriUtama] = useState('');
    const [dataNotSubKategori, setNotSubDataKategori] = useState('')

    const handleIDkategoriUtama = async (event, name) => {
        setNotSubDataKategori(name)
        setKategoriUtamaID(event)
        setNotSubKategori(true)
        setKategoriUtamaIDfalse(false)
    }

    const handleInputChangeKategoriUtama = (event) => {
        setKategoriUtama(event.target.value);
    };

    const handleTambahKategoriUtama = async (event) => {
        event.preventDefault();
        try {
            setLoadingKategoriUtama(true)
            await HandlePostCategoryUtama({
                "category": kategoriUtama,
                "slugCategory": kategoriUtama?.toLowerCase() // ubah jadi huruf kecil
                    ?.replace(/[^a-z0-9\s]/g, '') // hapus karakter selain huruf, angka, dan spasi
                    ?.trim() // hapus spasi di awal dan akhir
                    ?.replace(/\s+/g, '-'),
                "title": kategoriUtama,
                "tags": kategoriUtama,
                "image": `${process.env.NEXT_PUBLIC_URL2}/notfoundimage.png`,
                "icon": `${process.env.NEXT_PUBLIC_URL2}/notfoundicon.jpg`,
                "desc": `Temukan berbagai pilihan ${kategoriUtama} terbaik untuk kebutuhan sehari hari cadangan Anda, dari skala rumah tangga hingga industri. Tersedia ${kategoriUtama} berkualitas dengan daya bervariasi dan harga terjangkau.`
            })
            setLoadingKategoriUtama(false)
            toast.success(`kategori ${kategoriUtama} berhasil ditambahkan!`)
            setKategoriUtama('')
        }
        catch (e) {
            setLoadingKategoriUtama(false)
        }
        setKategoriUtama('')
    }

    const [kategori, setKategori] = useState('')
    const [kategoriID, setKategoriID] = useState(data ? data?.productKategori : '')

    const handleIDkategori = async (event) => {
        setKategoriID(event)
    }

    const handleInputChangeKategori = (event) => {
        setKategori(event.target.value);
    };

    const handleTambahKategori = async (event) => {
        event.preventDefault();
        try {
            setLoadingKategori(true)
            await HandlePostCategory({
                "categoryProductUtamaId": Number(kategoriUtamaID),
                "category": kategori,
                "slugCategory": kategori?.toLowerCase() // ubah jadi huruf kecil
                    ?.replace(/[^a-z0-9\s]/g, '') // hapus karakter selain huruf, angka, dan spasi
                    ?.trim() // hapus spasi di awal dan akhir
                    ?.replace(/\s+/g, '-'),
                "title": kategori,
                "tags": kategori,
                "image": `${process.env.NEXT_PUBLIC_URL}/notfoundimage.png`,
                "icon": `${process.env.NEXT_PUBLIC_URL}/notfoundicon.jpg`,
                "desc": `Temukan berbagai pilihan ${kategori} terbaik untuk kebutuhan sehari hari cadangan Anda, dari skala rumah tangga hingga industri. Tersedia ${kategori} berkualitas dengan daya bervariasi dan harga terjangkau.`
            })
            setLoadingKategori(false)
            toast.success(`kategori ${kategoriUtama} berhasil ditambahkan!`)
            setKategori('')
        }
        catch (e) {
            setLoadingKategori(false)
        }
        setKategori('')
    }

    //SPEKSIFIKASI
    const [specifications, setSpecifications] = useState(data ? data?.spekNew == null ? [{ id: 1, input: "", isi: "" }] : data?.spekNew : [{ id: 1, input: "", isi: "" }]);


    const handleAddSpecification = () => {
        setSpecifications([...specifications, { id: specifications.length + 1, input: "", isi: "" }]);
    };

    const handleRemoveSpecification = (id) => {
        setSpecifications(specifications.filter((spec) => spec.id !== id));
    };

    const handleChange = (id, field, value) => {
        setSpecifications(
            specifications.map((spec) =>
                spec.id === id ? { ...spec, [field]: value } : spec
            )
        );
    };

    const initialValues = {
        productName: data ? data?.productName : '',
        stockProduct: data ? data?.stockProduct : '',
        productType: data ? data?.productType : '',
        subKategoriProduct: data ? data?.subKategoriProduct : '',
        // productKategori: data ? data?.productKategori : '',
        tagProduct: data ? data?.tagProduct : '',
        productPrice: data ? data?.productPrice : '',
        productDiscount: data ? data?.productDiscount : '',
        productPriceFinal: data ? data?.productPriceFinal : '',
        urlYoutube: data ? data?.urlYoutube : '',
        descMetaProduct: data ? data?.descMetaProduct : '',
        descProduct: draftToHtml(convertToRaw(editorState.getCurrentContent())),

        phase_spec: data ? data?.spec_product?.phase_spec : '',
        frequency_spec: data ? data?.spec_product?.frequency_spec : '',
        gensetPower_spec: data ? data?.spec_product?.gensetPower_spec : '',
        ratedPower_spec: data ? data?.spec_product?.ratedPower_spec : '',
        maxPower_spec: data ? data?.spec_product?.maxPower_spec : '',
        ratedACVoltage_spec: data ? data?.spec_product?.ratedACVoltage_spec : '',
        starting_spec: data ? data?.spec_product?.starting_spec : '',
        fuelConsumption_spec: data ? data?.spec_product?.fuelConsumption_spec : '',
        weightProduct: data ? data?.weightProduct : '',
        lengthProduct: data ? data?.lengthProduct : '',
        widthProduct: data ? data?.widthProduct : '',
        heightProduct: data ? data?.heightProduct : '',
        dimension_spec: data ? data?.spec_product?.dimension_spec : '',
        // email: '',
        images: []
    };

    const validationSchema = Yup.object({
        productName: Yup.string()
            .max(100, '(max 100 huruf sajaa )')
            .required('****'),
        stockProduct: Yup.number()
            .max(99999, 'Must be 15 characters or less')
            .required('****'),
        tagProduct: Yup.string()
            .max(500, 'Must be 500 characters or less')
            .required('****'),
        productType: Yup.string()
            .max(200, 'Must be 200 characters or less')
            .required('****'),
        // productKategori: Yup.number().required('****'),
        // urlYoutube: Yup.string()
        //     .required('****'),
        descMetaProduct: Yup.string()
            .max(121, 'Max 121 charakters huruf')
            .required('****Max 121 charakters huruf'),
        // subKategoriProduct: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),

        productPrice: Yup.number()
            .max(9999999999, 'Must be 200 characters or less')
            .required('****'),
        productDiscount: Yup.number()
            .max(100, 'Must be 100 characters or less')
            .required('****'),
        // productPriceFinal: Yup.number()
        //     .max(9999999999, 'Must be 200 characters or less')
        //     .required('Required'),

        // phase_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        // frequency_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        // gensetPower_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        // ratedPower_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        // maxPower_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        // ratedACVoltage_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        // starting_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        // fuelConsumption_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        weightProduct: Yup.number()
            .max(5000, 'Max 5.000 Kg')
            .required('**** belum diisi'),
        lengthProduct: Yup.number()
            .max(50000000, 'Max 50.000.000cm')
            .required('**** belum diisi'),
        widthProduct: Yup.number()
            .max(50000000, 'Max 50.000.000cm')
            .required('**** belum diisi'),
        heightProduct: Yup.number()
            .max(50000000, 'Max 50.000.000cm')
            .required('**** belum diisi'),
        images: Yup.mixed().required('At least one file is required')
        // images: Yup.mixed()
        //     .test('fileFormat', 'Only Image files are allowed', value => {

        //         if (value) {
        //             const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'];
        //             return supportedFormats.includes(value?.name?.split('.')?.pop());
        //         }
        //         return true;
        //     })
        //     .test('fileSize', 'File size must not be more than 30MB',
        //         value => {
        //             if (value) {
        //                 return value?.size <= 32145728;
        //             }
        //             return true;
        //         }),
        // dimension_spec: Yup.string()
        //     .max(200, 'Must be 20 characters or less')
        //     .required('Required'),
        // email: Yup.string().email('Invalid email address').required('Required'),
    });

    const handleSubmit = async (value) => {

        // const isEmpty = Object.values(value).some((val) => val === "" || val === null);

        // if (isEmpty) {
        //     toast.error("Harap lengkapi semua data sebelum melanjutkan!");
        //     return; // stop submit
        // }


        try {
            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids: {
                        product: `product:${data?.slugProduct || 'abcdefghijklmnopzrefekekwkwk'}`,
                        listProduct: 'data:productList',
                        // generate searchAll1 sampai searchAll13
                        ...Object.fromEntries(
                            Array.from({ length: 1000 }, (_, i) => [
                                `searchAll${i + 1}`,
                                `search::m:All:t:${i + 1}`,
                            ])
                        ),
                    },
                }),
            });

            setKategori(false)
            setLoading(true)
            const slug = value?.productName
                ?.toLowerCase() // ubah jadi huruf kecil
                ?.replace(/[^a-z0-9\s]/g, '') // hapus karakter selain huruf, angka, dan spasi
                ?.trim() // hapus spasi di awal dan akhir
                ?.replace(/\s+/g, '-')


            // Validate if the slug is duplicate
            const slugData = pathname == '/post' ? await HandleValidasi(slug) : []

            if (pathname == '/post' && slugData?.data?.length) {
                // Handle duplicate slug
                toast.error("Produk dengan nama ini sudah ada, silakan pilih nama lain.");
                setLoading(false);
                return; // Stop further execution if slug exists
            } else {

                const dataImage = []
                const CouldinaryUtama = async () => {

                    const resultImage = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/cloudinary/e`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ image: DataImageUtama }),
                    });
                    const data1 = await resultImage.json();
                    dataImage.push(data1.data[0])
                }

                const dataListImage = []
                const CouldinaryList = async () => {
                    const resultListImage = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/cloudinary/e`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ image: DataImageList }),
                    });
                    const data2 = await resultListImage.json();
                    dataListImage.push(data2.data)
                }


                DataImageUtama.length && await CouldinaryUtama()
                DataImageList.length && await CouldinaryList()

                selectPubListImage.length && data && await HandleDeleteImageC(selectPubListImage)
                selectPubImageUtama.length && data && await HandleDeleteImageC(selectPubImageUtama)


                selectPubImageUtama.length && data &&
                    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/listProduct`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
                        },
                        body: JSON.stringify({
                            id: selectIDUtama,
                            kondisiImageUtama: selectPubImageUtama.length
                        }),
                    })


                //  LIST GAMBAR
                for (const public_id of selectPubListImage) {
                    {
                        selectPubListImage.length && data &&
                            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/listProduct`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
                                },
                                body: JSON.stringify({
                                    public_id: public_id,
                                    kondisiListImage: selectPubListImage.length
                                }),
                            })
                    }
                }

                await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/listProduct`, {
                    method: data ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
                    },
                    body: JSON.stringify(
                        data ? {
                            ...value,
                            descProduct: draftToHtml(convertToRaw(editorState.getCurrentContent())),
                            productPriceFinal: Math.round(value?.productPrice - ((value?.productPrice * value?.productDiscount) / 100)),
                            slugProduct: slug,
                            saveDraf: draf,
                            dataImage: dataListImage[0],
                            imageProductUtama: dataImage[0],
                            productKategori: Number(kategoriID),
                            IdProduct: data.id,
                            fMerek: selectedMerek.join(", "),
                            fMerekDelete: selectedMerekDelete.join(", "),
                            spekNew: specifications
                        } : {
                            ...value,
                            descProduct: draftToHtml(convertToRaw(editorState.getCurrentContent())),
                            productPriceFinal: Math.round(value?.productPrice - ((value?.productPrice * value?.productDiscount) / 100)),
                            slugProduct: slug,
                            saveDraf: draf,
                            dataImage: dataListImage[0],
                            imageProductUtama: dataImage[0],
                            productKategori: Number(kategoriID),
                            fMerek: selectedMerek.join(", "),
                            fMerekDelete: selectedMerekDelete.join(", "),
                            username: session.username,
                            spekNew: specifications
                        }),
                })

                setLoading(false)
                // router.push('/')

                pathname === "/" && setLayang()
                pathname.startsWith("/s/") && setLayang()
                router.refresh()
                toast.success('data berhasil ditambahkan!')
                !data && router.push('/')
                // handle the error
                // if (!res.ok) throw new Error(await res.text())
            }

        } catch (e) {
            // Handle errors here
            toast.error("Tidak Berhasil, silahkan Ulang")
            setLoading(false)
            console.error(e)
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ setFieldValue, values }) => {
                return (
                    <Form>
                        <div className={styles.container}>
                            <div className={styles.dalamcontainer}>
                                <div className={styles.form}>
                                    <div className={styles.atas}>
                                        <Link target='_blank' href={'/'} className={styles.kiri}>
                                            {data ? data?.productName : 'PelangiTeknik'}
                                        </Link>
                                        <div className={styles.kanan}>
                                            <button disabled={loading} type='submit' onClick={() => setDraf(true)} className={styles.draf} >{draf ? loading ? 'Loading...' : 'Save to Draf' : 'Save to Draf'}</button>
                                            <button disabled={loading} type='submit' onClick={() => setDraf(false)} className={styles.save}>{draf ? text ? text : 'Save Product' : loading ? 'Loading...' : text ? text : 'Save Product'}</button>
                                            {!kondisi && <Logout />}
                                        </div>
                                    </div>
                                    {loading && <div className={styles.animasiloading}></div>}
                                    {loading && <div className={styles.animasidalam}>
                                        <LottieAnimation animationPath={`${process.env.NEXT_PUBLIC_URL}/rocket.json`} />
                                        <div className={styles.textloading}>
                                            Wwkwkwkwk Loading.... Tunggu...
                                        </div>
                                    </div>}

                                    <div className={styles.bawah}>
                                        <div className={styles.productImage}>
                                            <div className={styles.judul}>Meta Tag Google</div>
                                            <hr />
                                            <div className={styles.isi}>
                                                <div className={styles.tag}>
                                                    <label htmlFor="tagProduct">Kata Kunci(tag)<ErrorMessage name="tagProduct" component="div" style={{ color: 'red' }} /></label>
                                                    <Field type="text"
                                                        name="tagProduct"
                                                        id="tagProduct"
                                                        placeholder={'ex: genset slient, genset 20kva'}
                                                        disabled={loading}
                                                    />

                                                </div>
                                                <div className={styles.tag}>
                                                    <label htmlFor="descMetaProduct">Deskripsi  <ErrorMessage name="descMetaProduct" component="div" style={{ color: 'red' }} /></label>
                                                    <Field
                                                        type="text"
                                                        as="textarea"
                                                        name="descMetaProduct"
                                                        id="descMetaProduct"
                                                        placeholder="ex: Genset Silent Diesel 9 Kva Tsuzumi TDG 10000 S dengan daya 7000 Watt, 1 Phase, cocok untuk rumah dan usaha. Desain silent, hemat bahan bakar, dan performa mesin diesel yang handal. "
                                                        disabled={loading}
                                                    />

                                                </div>
                                                <div className={styles.tag}>
                                                    <label htmlFor="urlYoutube">Url Youtube  <ErrorMessage name="urlYoutube" component="div" style={{ color: 'red' }} /></label>
                                                    <Field
                                                        type="text"
                                                        name="urlYoutube"
                                                        id="urlYoutube"
                                                        placeholder='ex: https://www.youtube.com/watch?v=MZyjr4bDYWs'
                                                        disabled={loading}
                                                    />

                                                </div>
                                                <div className={styles.judulsamping}>Product Image</div>
                                                <ErrorMessage name="images" component="div" style={{ color: 'red' }} />

                                                <div>
                                                    {!images[0]?.preview ?
                                                        <>
                                                            <label className={styles.gambarutama} style={images[0].kondisi ? { border: '1px solid red' } : {}} htmlFor="image1">
                                                                <MdOutlineFileUpload /> &nbsp;Gambar Utama
                                                                {images[0].kondisi && <div style={{ color: 'red' }}>max 10MB</div>}
                                                            </label>
                                                            <input
                                                                style={{ display: 'none' }}
                                                                type="file"
                                                                id="image1"
                                                                name="image1"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageChange(e, 0)}
                                                            />
                                                        </>
                                                        :
                                                        <>
                                                            {data ?
                                                                <>
                                                                    <Image src={images[0]?.preview} width={220} height={220} alt="Preview Gambar Utama" className={styles.previewImageUtama} />
                                                                    {!loading && <div className={styles.deleteButtonutama} onClick={() => handleDeleteLocalUtama(images[0]?.public_id, 0, images[0].id,)}>Hapus</div>}
                                                                </>
                                                                : <>
                                                                    <Image src={images[0]?.preview} width={220} height={220} className={styles.previewImageUtama} alt="Preview Gambar 1" />
                                                                    {!loading && <div className={styles.deleteButtonutama} onClick={() => handleDelete(0)}>Hapus</div>}
                                                                </>}
                                                        </>
                                                    }
                                                </div>

                                                <div className={styles.listgambar}>

                                                    {images.map((data, i) => {
                                                        return (
                                                            <div key={i} style={i == 0 ? { display: 'none' } : {}}>
                                                                {!images[i]?.preview ?
                                                                    <>
                                                                        <label className={styles.gambarnew}
                                                                            style={images[i].kondisi ? { border: '1px solid red' } : {}}
                                                                            htmlFor={i}>
                                                                            <MdOutlineFileUpload /> &nbsp;Upload Gambar
                                                                            {images[i].kondisi && <div style={{ color: 'red' }}>max 10MB</div>}
                                                                        </label>
                                                                        <input
                                                                            style={{ display: 'none' }}
                                                                            type="file"
                                                                            id={i}
                                                                            name={i}
                                                                            accept="image/*"
                                                                            onChange={(e) => handleImageChange(e, i)}
                                                                        />
                                                                    </>
                                                                    :
                                                                    <>
                                                                        {data ?
                                                                            <>
                                                                                <Image src={images[i]?.preview} width={110} height={110} alt="Preview Gambar Utama" className={styles.previewImage} />
                                                                                {!loading && <div className={styles.deleteButton} onClick={() => handleDeleteLocal(images[i]?.public_id, i)}>Hapus</div>}
                                                                            </>
                                                                            : <>
                                                                                <Image src={images[i]?.preview} width={110} height={110} className={styles.previewImage} alt="Preview Gambar 1" />
                                                                                {!loading && <div className={styles.deleteButton} onClick={() => handleDelete(i)}>Hapus</div>}
                                                                            </>}
                                                                    </>
                                                                }
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                            </div>
                                        </div>
                                        <div className={styles.detaildetail}>
                                            <div className={styles.detail}>
                                                <div className={styles.judul}>General Information</div>
                                                <hr />
                                                <div className={styles.isi}>
                                                    <label htmlFor="productName">Product Name [ Merek + Kapasitas + Fitur + Kata Kunci + Keunggulan ] max 100kar <ErrorMessage name="productName" component="div" style={{ color: 'red' }} /></label>
                                                    <Field
                                                        type="text"
                                                        name="productName"
                                                        id="productName"
                                                        placeholder={'ex: Genset Tsuzumi TFS 30 KVA '}
                                                        disabled={loading}
                                                    />
                                                    <div className={styles.fmerek}>
                                                        <label>Pilih Merek:</label>
                                                        <div className={styles.dalamcek}>
                                                            {mereks?.map((data, i) => {
                                                                return (
                                                                    <div style={data?.name == "" ? { display: 'none' } : {}} key={data?.id} >
                                                                        <label className={styles.labelcek}>
                                                                            <input
                                                                                type="checkbox"
                                                                                value={data?.name}
                                                                                checked={selectedMerek?.includes(data?.name)}
                                                                                onChange={() => handleFMerek(data?.name)}
                                                                            />
                                                                            <div>
                                                                                {data?.name}
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                )
                                                            }
                                                            )}
                                                            {/* <div className="tambahkan">
                                                            <input type="text" placeholder='tambahkan merek' />
                                                            <button>Tambakan</button>
                                                        </div> */}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>


                                            <div className={styles.detail} style={{ margin: '20px 0' }}>
                                                <div className={styles.judul}>Kategori</div>
                                                <hr />
                                                <div className={styles.dalamcek} >
                                                    {dataKategoriUtama?.map((data, i) => {
                                                        return (
                                                            <div key={i} style={data?.category === "" ? { display: 'none' } : {}} >
                                                                <label className={styles.labelcek}>
                                                                    <input
                                                                        type="checkbox"
                                                                        name="kategoriUtama" // Semua radio button berbagi `name` agar hanya satu yang bisa dipilih
                                                                        value={data?.category}
                                                                        checked={kategoriUtamaID == data.id} // Hanya satu yang bisa aktif
                                                                        onChange={() => handleIDkategoriUtama(data.id, data?.category)} // Pilih kategori saat radio dipilih
                                                                    />
                                                                    <div>{data?.category}</div>
                                                                </label>
                                                            </div>
                                                        )
                                                    })}

                                                    <div className="tambahkan">
                                                        <input onChange={handleInputChangeKategoriUtama} type="text" disabled={loadingKategoriUtama} placeholder="+ Kategori Utama" />
                                                        <button onClick={handleTambahKategoriUtama}>{loadingKategoriUtama ? 'Loading...' : 'Tambahkan'}</button>
                                                    </div>
                                                </div>

                                            </div>


                                            {Boolean(dataSubKategori?.length) ?
                                                <div className={styles.detail} style={{ margin: '20px 0' }}>
                                                    <div className={styles.judul}>Sub Kategori</div>
                                                    <hr />
                                                    <div className={styles.fmerek} >
                                                        <div className={styles.dalamcek}>
                                                            {dataSubKategori?.map((data, i) => {
                                                                return (
                                                                    <div style={data.category == "" ? { display: 'none' } : {}} key={i} >
                                                                        <label className={styles.labelcek}>
                                                                            <input
                                                                                type="checkbox"
                                                                                value={data.category}
                                                                                checked={kategoriID == data.id} // Hanya satu yang bisa aktif
                                                                                onChange={() => handleIDkategori(data.id)} // Pilih kategori saat radio dipilih

                                                                            />
                                                                            <div>
                                                                                {data.category}
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                )
                                                            }
                                                            )}
                                                            <div className="tambahkan">
                                                                <input onChange={handleInputChangeKategori} type="text" disabled={loadingKategori} placeholder='+ Sub kategori' />
                                                                <button onClick={handleTambahKategori}>{loadingKategori ? 'Loading...' : 'Tambahkan'}</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> :
                                                notSubKategori &&
                                                <div className={styles.detail} style={{ margin: '20px 0' }}>
                                                    <div className={styles.judul}>belum ada Sub Kategori <span style={{ color: 'red' }}> {dataNotSubKategori}</span></div>
                                                    <hr />
                                                    <div className={styles.fmerek} style={{ padding: 20 }}>
                                                        <div className={styles.dalamcek}>
                                                            <div className="tambahkan">
                                                                <input onChange={handleInputChangeKategori} type="text" disabled={loadingKategori} placeholder='+ Sub kategori' />
                                                                <button onClick={handleTambahKategori}>{loadingKategori ? 'Loading...' : 'Tambahkan'}</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }


                                            <div className={styles.detail} style={{ margin: '20px 0' }}>
                                                <div className={styles.judul}>Detail Barang</div>
                                                <hr />
                                                <div className={styles.satubaris} >
                                                    <div className={styles.bariskan}>
                                                        <label htmlFor="stockProduct">Stock Product  <ErrorMessage name="stockProduct" component="div" style={{ color: 'red' }} /></label>
                                                        <Field
                                                            type="number"
                                                            name="stockProduct"
                                                            id="stockProduct"
                                                            placeholder={'ex: 25'}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <div className={styles.bariskan}>
                                                        <label htmlFor="productType">Product Type  <ErrorMessage name="productType" component="div" style={{ color: 'red' }} /></label>
                                                        <Field
                                                            type="text"
                                                            name="productType"
                                                            id="productType"
                                                            placeholder={'ex: TDG10000S'}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                </div>
                                                <div className={styles.satubaris} >
                                                    <div className={styles.bariskan}>
                                                        <label htmlFor="productPrice">Price  <ErrorMessage name="productPrice" component="div" style={{ color: 'red' }} /></label>
                                                        <Field
                                                            type="number"
                                                            name="productPrice"
                                                            id="productPrice"
                                                            placeholder={'ex: 1000000'}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <div className={styles.bariskan}>
                                                        <label htmlFor="productDiscount">Discount (optional)  <ErrorMessage name="productDiscount" component="div" style={{ color: 'red' }} /></label>
                                                        <Field
                                                            type="number"
                                                            name="productDiscount"
                                                            id="productDiscount"
                                                            placeholder={'ex: 10'}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <div className={styles.bariskan}>
                                                        <label htmlFor="productPriceFinal">Discount Price  <ErrorMessage name="productPriceFinal" component="div" style={{ color: 'red' }} /></label>
                                                        <input
                                                            id="productPriceFinal"
                                                            name="productPriceFinal"
                                                            type="number"
                                                            value={Math.round(values?.productPrice - ((values?.productPrice * values?.productDiscount) / 100)) != 0 && Math.round(values?.productPrice - ((values?.productPrice * values?.productDiscount) / 100))}
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                                <label htmlFor="productDescription">Deskripsi</label>
                                                <Editor
                                                    editorState={editorState}
                                                    toolbarClassName="toolbarClassName"
                                                    wrapperClassName="wrapperClassName"
                                                    editorClassName="editorClassName"
                                                    placeholder="Tulis Diskripsi..."
                                                    onEditorStateChange={onEditorStateChange}
                                                />
                                            </div>

                                            <div className={styles.detail} style={{ margin: '20px 0' }}>
                                                <div className={styles.judul}>Berat Barang ( max 5000kg )</div>
                                                <hr />
                                                <div className={styles.isi}>
                                                    <div className={styles.satubaris}>
                                                        <div className={styles.bariskan} style={{ width: '300px' }}>
                                                            <label htmlFor="weightProduct">Weight (satuan kilogram) <ErrorMessage name="weightProduct" component="div" style={{ color: 'red' }} /></label>
                                                            <Field disabled={loading} placeholder={'ex: 10'} type="number" name="weightProduct" id="weight_spec" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.detail} style={{ margin: '20px 0' }}>
                                                <div className={styles.judul}>Dimensi Product (P x L x T)</div>
                                                <hr />
                                                <div className={styles.isi}>
                                                    <div className={styles.satubaris}>
                                                        <div className={styles.bariskan} style={{ width: '300px' }}>
                                                            <label htmlFor="lengthProduct">Panjang (cm) <ErrorMessage name="lengthProduct" component="div" style={{ color: 'red' }} /></label>
                                                            <Field disabled={loading} placeholder={'ex: 100'} type="number" name="lengthProduct" id="length_spec" />
                                                        </div>
                                                        <div className={styles.bariskan} style={{ width: '300px' }}>
                                                            <label htmlFor="widthProduct">Lebar (cm) <ErrorMessage name="widthProduct" component="div" style={{ color: 'red' }} /></label>
                                                            <Field disabled={loading} placeholder={'ex: 50'} type="number" name="widthProduct" id="width_spec" />
                                                        </div>
                                                        <div className={styles.bariskan} style={{ width: '300px' }}>
                                                            <label htmlFor="heightProduct">Tinggi (cm) <ErrorMessage name="heightProduct" component="div" style={{ color: 'red' }} /></label>
                                                            <Field disabled={loading} placeholder={'ex: 30'} type="number" name="heightProduct" id="height_spec" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.speksifikasibaru}>
                                                <div className={styles.judul} style={{ padding: '20px 40px 10px 40px' }}>Spesifikasi Produk</div>
                                                <hr />
                                                <div className={styles.dalamspek}>
                                                    {specifications?.map((spec) => (
                                                        <div key={spec?.id} style={{ marginBottom: "8px", display: "flex" }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Spesifikasi"
                                                                value={spec?.input}
                                                                onChange={(e) => handleChange(spec?.id, "input", e.target.value)}
                                                                style={{ marginRight: "8px" }}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Isi"
                                                                value={spec?.isi}
                                                                onChange={(e) => handleChange(spec?.id, "isi", e.target.value)}
                                                                style={{ marginRight: "8px" }}
                                                            />
                                                            <div className={styles.tombol} onClick={() => handleRemoveSpecification(spec?.id)}>Hapus</div>
                                                        </div>
                                                    ))}
                                                    <div className={styles.tombol} onClick={handleAddSpecification}>Tambahkan Spesifikasi</div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                )
            }
            }
        </Formik >

    );
}
