'use client'
import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from '@/components/formInput.module.css'
import Image from 'next/image';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";
import { useRouter, usePathname } from 'next/navigation';
import { MdOutlineFileUpload } from "react-icons/md";
import { HandleDeleteImageC } from '@/service/handleDeleteImageC';
import { useCon } from '@/zustand/useCon';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Logout from './logout';
import { HandleValidasiArtikel } from '@/service/artikel/handleValidasi';
import { HandlePostCategoryArtikel } from '@/service/artikel/handlePostKategori';
import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";
import { GetProduct } from '@/service/n';

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
    ssr: false
});

export default function FormInputArtikel({ data, text, dataKategori, kondisi, dataTagsArtikel, dataArtikel }) {

    const tags = dataTagsArtikel?.map((data) => data?.name);

    const [selectedTags, setSelectedTags] = useState(
        data ? data?.tagsArtikel?.map((e) => e?.name) : []
    );
    const [selectedTagsDelete, setSelectedTagsDelete] = useState([]);
    const [slugProductRelation, setSlugProductRelation] = useState(data?.relatedProducts[0]?.slugProduct || "")

    const handleTagChange = (tag) => {
        setSelectedTags((prevTags) => {
            if (!prevTags.includes(tag)) {
                setSelectedTagsDelete((prevDeletedTags) =>
                    prevDeletedTags.filter((t) => t !== tag)
                );
                return [...prevTags, tag];
            } else {
                setSelectedTagsDelete((prevDeletedTags) =>
                    prevDeletedTags.includes(tag)
                        ? prevDeletedTags
                        : [...prevDeletedTags, tag]
                );
                return prevTags.filter((t) => t !== tag);
            }
        });
    };

    const [images, setImages] = useState([
        {
            preview: data?.imageProductArtikel ? data?.imageProductArtikel[0]?.secure_url : null,
            nameFile: '',
            file: null,
            public_id: data?.imageProductArtikel[0]?.public_id ? data?.imageProductArtikel[0]?.public_id : null,
            kondisi: false
        }
    ]);

    const ImageUtama = [images[0]];
    const DataImageUtama = ImageUtama.filter((Image) => Image.file != null);
    const [selectIDImage, setSelectIDImage] = useState([]);

    const handleImageChange = (event, imageIndex) => {
        const file = event.target.files[0];
        if (file.size > 10000 * 1024) { // 10MB
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
            reader.readAsDataURL(file);
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
            setSelectIDImage([...selectIDImage, e]);
            setImages((prevImages) => {
                const updatedImages = [...prevImages];
                updatedImages[imageIndex] = { preview: null, nameFile: '', file: null, kondisi: false };
                return updatedImages;
            });
        }
    };

    const [klikKategori, setKlikKategori] = useState(false);
    const pathname = usePathname();
    const setLayangArtikel = useCon((state) => state.setLayangArtikel);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [draf, setDraf] = useState(null);
    const [kategori, setKategori] = useState('');
    const [loadingKategori, setLoadingKategori] = useState(false);

    const handleInputChangeKategori = (event) => setKategori(event?.target.value);

    const handleSubmitKategori = async (event) => {
        event.preventDefault();
        setLoadingKategori(true);

        if (dataKategori?.filter((data) => data?.category == kategori).length) {
            toast.error(`Produk kategori ${kategori} sudah ada, silakan pilih kategori lain.`);
            setLoadingKategori(false);
            return;
        } else {
            await HandlePostCategoryArtikel({
                "category": kategori,
                "slugCategory": kategori?.toLowerCase()
                    ?.replace(/[^a-z0-9\s]/g, '')
                    ?.trim()
                    ?.replace(/\s+/g, '-'),
                "title": kategori,
                "tags": kategori,
            });
            setLoadingKategori(false);
            setKlikKategori(false);
            setKategori('');
            toast.success(`kategori ${kategori} berhasil ditambahkan!`);
            router.refresh();
        }
    };

    const [dataProduct, setDataProduct] = useState(null)
    const [LoadingDataProduct, setLoadingDataProduct] = useState(false)

    const HandleCekProduct = async (e) => {
        e.preventDefault()
        setLoading(true)
        const res = await GetProduct(slugProductRelation)
        setDataProduct(res)
        setLoadingDataProduct(res[0] ? true : false)
        setLoading(false)
    }

    const initialValues = {
        title: data ? data?.title : '',
        categoryArtikelId: data ? data?.categoryArtikelId : '',
        content: data ? data?.content : '## Tulis Diskripsi di sini!',
        description: data ? data?.description : '',
        images: [],
    };

    const validationSchema = Yup.object({
        title: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .required('*Must be 50 characters or less'),
        content: Yup.string()
            .min(300, 'Minimal 300 Karakter')
            .required('*Minimal 300 Karakter'),
        description: Yup.string()
            .max(121, 'Max 121 charakters huruf')
            .required('*Max 121 charakters huruf'),
        categoryArtikelId: Yup.number().required('* Pilih Pemilik'),
        images: Yup.mixed().required('At least one file is required')
    });

    const handleSubmit = async (value) => {
        try {
            setLoading(true);
            const slug = value?.title
                ?.toLowerCase()
                ?.replace(/[^a-z0-9\s]/g, '')
                ?.trim()
                ?.replace(/\s+/g, '-');

            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids: {
                        blogMeta: `blogMeta:${data?.slugProduct || 'abcdefghijklmnopzrefekekwkwk'}`,
                        blog: `blog:${data?.slugProduct || 'abcdefghijklmnopzrefekekwkwk'}`,
                    },
                }),
            });

            const slugData = pathname == '/postartikel' ? await HandleValidasiArtikel(slug) : [];

            if (pathname == '/postartikel' && slugData?.data?.length) {
                toast.error("Produk dengan nama ini sudah ada, silakan pilih nama lain.");
                setLoading(false);
                return;
            } else {
                const dataImage = [];
                const CouldinaryUtama = async () => {
                    const resultImage = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/cloudinary/a`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: DataImageUtama }),
                    });
                    const data1 = await resultImage.json();
                    dataImage.push(data1.data[0]);
                };

                DataImageUtama.length && await CouldinaryUtama();

                selectIDImage.length && data &&
                    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/listArtikel`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
                        },
                        body: JSON.stringify({ IdProductArtikel: data.id }),
                    });

                await fetch(`${process.env.NEXT_PUBLIC_URL}/api/a/listArtikel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${process.env.NEXT_PUBLIC_SECREET}`
                    },
                    body: JSON.stringify(data ? {
                        ...value,
                        slug,
                        saveDraf: draf,
                        dataImage,
                        categoryArtikelId: Number(value.categoryArtikelId),
                        IdArtikel: data.id,
                        newTags: selectedTags.join(", "),
                        tagDelete: selectedTagsDelete.join(", "),
                        productSlugs: slugProductRelation.split(", "),
                        productSlugsDelete: data?.relatedProducts[0]?.slugProduct || ''
                    } : {
                        ...value,
                        slug,
                        saveDraf: draf,
                        dataImage,
                        categoryArtikelId: Number(value.categoryArtikelId),
                        newTags: selectedTags.join(", "),
                        tagDelete: selectedTagsDelete.join(", "),
                        productSlugs: slugProductRelation.split(", "),
                        productSlugsDelete: data?.relatedProducts[0]?.slugProduct || ''
                    }),
                });

                selectIDImage.length && data && await HandleDeleteImageC(selectIDImage);

                setLoading(false);
                router.push('/');
                router.refresh();
                pathname == '/' && setLayangArtikel();
                toast.success('data berhasil ditambahkan!');
            }

        } catch (e) {
            toast.error("Tidak Berhasil, silahkan Ulang");
            setLoading(false);
            console.error(e);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ setFieldValue, values }) => (
                <Form>
                    <div className={styles.container}>
                        <div className={styles.dalamcontainer}>
                            <div className={styles.form}>
                                <div className={styles.atas}>
                                    <Link target='_blank' href={'/'} className={styles.kiri}>
                                        {data ? data?.title : 'PelangiTeknik'}
                                    </Link>
                                    <div className={styles.kanan}>
                                        <button disabled={loading} type='submit' onClick={() => setDraf(true)} className={styles.draf}>
                                            {loading ? 'Loading...' : 'Save to Draf'}
                                        </button>
                                        <button disabled={loading} type='submit' onClick={() => setDraf(false)} className={styles.save}>
                                            {loading ? 'Loading...' : text ? text : 'Save Artikel'}
                                        </button>
                                        {!kondisi && <Logout />}
                                    </div>
                                </div>

                                <div className={styles.bawah}>
                                    <div className={styles.productImage}>
                                        <div className={styles.judul}>Meta Tag Google</div>
                                        <hr />
                                        <div className={styles.isi}>
                                            <div className={styles.bariskankategori}>
                                                {klikKategori && (
                                                    <div className={styles.tambahkategori}>
                                                        <div className={styles.ataskategori}>
                                                            <label htmlFor="kategori">Tambah Kategori</label>
                                                            {!loadingKategori && (
                                                                <div
                                                                    className={styles.closekategori}
                                                                    style={{ position: 'absolute', right: 0, top: '-25px', background: 'red', color: 'white', cursor: 'pointer' }}
                                                                    onClick={() => setKlikKategori(!klikKategori)}>x</div>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <input
                                                                style={{ width: '70%' }}
                                                                type="text"
                                                                id="kategori"
                                                                value={kategori}
                                                                onChange={handleInputChangeKategori}
                                                                placeholder="Masukkan kategori"
                                                                required
                                                                disabled={loadingKategori}
                                                            />
                                                            <button onClick={handleSubmitKategori} type="submit">
                                                                {loadingKategori ? 'Loading' : 'Tambah'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <label htmlFor="categoryArtikelId">
                                                    Kategori <ErrorMessage name="categoryArtikelId" component="div" style={{ color: 'red' }} />
                                                    &nbsp;
                                                    <div className={styles.tambahkategoriklik} onClick={() => setKlikKategori(!klikKategori)}>(Tambah ?)</div>
                                                </label>

                                                <Field as="select" name="categoryArtikelId" id="categoryArtikelId">
                                                    <option value="">Select a Kategori</option>
                                                    {dataKategori?.map((data, i) => (
                                                        <option key={i} value={data?.id}>{data?.category}</option>
                                                    ))}
                                                </Field>
                                            </div>

                                            <div className={styles.tag}>
                                                <label>Pilih Tag:</label>
                                                {tags?.map((tag) => (
                                                    <div key={tag}>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                value={tag}
                                                                checked={selectedTags?.includes(tag)}
                                                                onChange={() => handleTagChange(tag)}
                                                            />
                                                            {tag}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={styles.tag}>
                                                <label htmlFor="slugProductRelation">
                                                    Relasi Slug Artikel <ErrorMessage name="slugProductRelation" component="div" style={{ color: 'red' }} />
                                                </label>
                                                <input style={{ width: '100%' }}
                                                    placeholder="ex: genset-silent-inverter-10-kva-8000-watt-1-phase-tsuzumi-tig-10000-ise"
                                                    type="text"
                                                    name="slugProductRelation"
                                                    id="slugProductRelation"
                                                    value={slugProductRelation}
                                                    onChange={(e) => { setSlugProductRelation(e.target.value) }} />
                                                <button onClick={HandleCekProduct}>{loading ? 'Loading...' : 'Cek Produk'}</button> <span>{dataProduct ? <span style={{ color: 'green', fontWeight: 700 }}>TRUE</span> : LoadingDataProduct ? <span style={{ color: 'red', fontWeight: 700 }}>FALSE</span> : ''}</span>
                                            </div>

                                            <div className={styles.tag}>
                                                <label htmlFor="description">Description <ErrorMessage name="description" component="div" style={{ color: 'red' }} /></label>
                                                <Field placeholder="ex: genset adalah perangkat..." as="textarea" name="description" id="description" />
                                            </div>

                                            <div className={styles.judulsamping}>Product Image</div>

                                            {!images[0]?.preview ? (
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
                                            ) : (
                                                <>
                                                    {data ? (
                                                        <>
                                                            <Image src={images[0]?.preview} width={220} height={220} alt="Preview Gambar Utama" className={styles.previewImageUtama} />
                                                            {!loading && <div className={styles.deleteButtonutama} onClick={() => handleDeleteLocal(images[0]?.public_id, 0)}>Hapus</div>}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Image src={images[0]?.preview} width={220} height={220} className={styles.previewImageUtama} alt="Preview Gambar 1" />
                                                            {!loading && <div className={styles.deleteButtonutama} onClick={() => handleDelete(0)}>Hapus</div>}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.detaildetail}>
                                        <div className={styles.detail}>
                                            <div className={styles.judul}>General Information</div>
                                            <hr />
                                            <div className={styles.isi}>
                                                <label htmlFor="title">
                                                    Judul Artikel <ErrorMessage name="title" component="div" style={{ color: 'red' }} />
                                                </label>
                                                <Field placeholder="ex: Cara merawat genset..." type="text" name="title" id="title" />

                                                <label htmlFor="content">
                                                    Deskripsi Artikel <ErrorMessage name="content" component="div" style={{ color: 'red' }} />
                                                </label>
                                                <SimpleMDE
                                                    value={values.content}
                                                    onChange={(value) => setFieldValue("content", value)}
                                                    height={400}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
