'use client'

import styles from '@/components/listProductNew.module.css'
import { useCon } from '@/zustand/useCon'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useEffect } from 'react'
import { GetListProduct, GetFilterProduct, GetProduct } from "@/service/n";
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import Image from 'next/image'
import { FormatRupiah } from '@/utils/formatRupiah'
import { TimeConverter } from '@/utils/formatMoment'
import { handleDetailProduct } from '@/service/handleDetailProduct'
import { HandleDetailArtikel } from '@/service/artikel/handleDetail'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { UpdateStockProduct } from '@/service/handlePutStockProduct'
import { UpdatePriceProduct } from '@/service/handlePutPriceProduct'
import { HandleDeleteProduct } from '@/service/handleDeleteProduct'
import { DeleteProductFromES } from '@/service/elasticSearch/deleteElasticSearch'
import { HandleDraf } from '@/service/handleDraf'

const FormInput = dynamic(() => import('@/components/FormInput'), {
    loading: () => <p>Loading Form...</p>, // Optional: loading state while the component is being loaded
    ssr: false // Disable server-side rendering for this component
});
const FormInputArtikel = dynamic(() => import('@/components/FormInputArtikel'), {
    loading: () => <p>Loading Form...</p>, // Optional: loading state while the component is being loaded
    ssr: false // Disable server-side rendering for this component
});

export default function ListProductNew({ session, query, dataKategori }) {
    // console.log('ARTIKELLL', dataArtikel);

    const spv = session?.user?.email === 'rio@pelangiteknik.com'
    const router = useRouter()
    const searchParams = useSearchParams()
    const m = searchParams.get('m')

    const setLayang = useCon((state) => state.setLayang)
    const layang = useCon((state) => state.layang)
    const setLayangArtikel = useCon((state) => state.setLayangArtikel)
    const setIsPenawaran = useCon((state) => state.setIsPenawaran)

    const DataProduct = useCon((state) => state.DataProduct)
    const totalMaxProduct = useCon((state) => state.totalMaxProduct)
    const setDataProduct = useCon((state) => state.setDataProduct)
    const setTotalMaxProduct = useCon((state) => state.setTotalMaxProduct)
    const setTotalProduct = useCon((state) => state.setTotalProduct)
    const setLoading = useCon((state) => state.setLoading)
    const loading = useCon((state) => state.loading)
    const setTotalPenawaran = useCon((state) => state.setTotalPenawaran)
    const isSuccess = useCon((state) => state.isSuccess)
    const setIsSuccess = useCon((state) => state.setIsSuccess)

    const [editStockId, setEditStockId] = useState(null);
    const [stockValue, setStockValue] = useState('');

    const [editPriceId, setEditPriceId] = useState(null);
    const [priceValue, setPriceValue] = useState('');
    const [dataProductDetail, setDataProductDetail] = useState(null)
    const [dataArtikelUpdate, setDataArtikelUpdate] = useState(null)
    const [search, setSearch] = useState(query)
    const [dataSlugUpdatePublish, setDataAtaSlugUpdatePublish] = useState(null)
    const [dataSlugProduct, setDataSlugProduct] = useState(null)

    const [isLoadingStockPrice, setLoadingStockPrice] = useState(false)

    const ITEMS_PER_PAGE = 5;

    const [currentPage, setCurrentPage] = useState(1);

    // total halaman
    const totalPages = Math.ceil(totalMaxProduct / ITEMS_PER_PAGE);

    // offset data (skip)
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const handlePrev = () => {
        if (currentPage <= 1) return;
        setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage >= totalPages) return;
        setCurrentPage((prev) => prev + 1);
    };

    useEffect(() => {
        try {
            setLoading(true)
            const fetchDataShop = async () => {
                const res = await GetListProduct(currentPage, ITEMS_PER_PAGE, m, query)
                setTotalMaxProduct(res?.totalMaxProduct)
                setTotalProduct(res?.totalProduct)
                setDataProduct(res?.data)
            }

            fetchDataShop()
            setLoading(false)
        }
        catch (e) {
            console.log(e)
        }
    }, [currentPage, m, search, dataSlugUpdatePublish, dataSlugProduct, loading, isSuccess])

    const GetDetailProduct = async (id) => {
        setLoading(true)
        try {
            // const data = await handleDetailProduct(id)
            // setDataProductDetail(data?.data[0])
            // setLayang()
            router.push(`/${id}`)
            setLoading(false)
        } catch {
            setLoading(false)
            toast.error(`Error Internet`);
        }
    }
    const GetDetailProductArtikel = async (id) => {
        setLoading(true)
        try {
            setLayangArtikel()
            const data = await HandleDetailArtikel(id)
            setDataArtikelUpdate(data?.data)
            setLoading(false)
        } catch {
            setLoading(false)
            toast.error(`Error Internet`);
        }
    }
    const HandleDeleteProducts = async (e, slug) => {
        if (confirm('Apakah yakin hapus?')) {
            // Save it!
            setLoading(true)
            try {
                await DeleteProductFromES(e)
                await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ids: {
                            product: `product:${slug || 'abcdefghijklmnopzrefekekwkwk'}`,
                        },
                    }),
                });
                await HandleDeleteProduct(e)
                setLoading(false)
                setDataSlugProduct(e)
                toast.success('Successfully!')
            } catch {
                setLoading(false)
                toast.error(`Error Internet`);
            }
        } else {
            // Do nothing!
            console.log('Thing was not saved to the database.');
        }
    }

    const updateTotal = () => {
        const data = JSON.parse(
            localStorage.getItem('DataPenawaran') || '[]'
        );
        setTotalPenawaran(data.length);
    };

    const AddFormPenawaran = (data) => {
        setIsPenawaran(true);

        const existing = JSON.parse(
            localStorage.getItem('DataPenawaran') || '[]'
        );

        // cek index produk
        const index = existing.findIndex(
            (item) => item.id === data.id
        );

        if (index !== -1) {
            // kalau sudah ada → tambah qty
            existing[index].qty = (existing[index].qty || 1) + 1;
            toast.success('Produk berhasil ditambahkan + 1');
        } else {
            // kalau belum ada → tambah baru + qty 1
            existing.push({
                ...data,
                qty: 1
            });
            toast.success('Produk berhasil ditambahkan');
        }

        localStorage.setItem(
            'DataPenawaran',
            JSON.stringify(existing)
        );

        updateTotal();
    };

    const UpdatePublish = async (slug, draf) => {
        setLoading(true)
        try {
            await HandleDraf(slug, draf)
            /** ================== REDIS ================== */
            const redisToast = toast.loading("Membersihkan cache...");
            try {
                await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ids: {
                            product: `product:${slug || 'abcdefghijklmnopzrefekekwkwk'}`,
                            listProduct: 'data:productList'
                        },
                    }),
                });
                toast.success("Cache berhasil dibersihkan", { id: redisToast });
            } catch (err) {
                toast.error("Gagal membersihkan cache", { id: redisToast });
                throw err;
            }
            setLoading(false)
            // setDataAtaSlugUpdatePublish(draf)
            toast.success('Successfully!')
        } catch {
            setLoading(false)
            toast.error(`Error Internet`);
        }
    }


    const saveStock = async (item) => {
        console.log(item);
        console.log(stockValue);
        setLoadingStockPrice(true)
        const newValue = Number(stockValue)

        if (Number.isNaN(newValue) || newValue < 0) {
            setLoadingStockPrice(false)
            setEditStockId(null)
            return
        }

        if (newValue === item.stockProduct) {
            setLoadingStockPrice(false)
            setEditStockId(null)
            return
        }

        setLoadingStockPrice(true)

        const abc = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/putStock`, {
            method: 'PUT',
            body: JSON.stringify({
                slugProduct: item.slugProduct,
                stockProduct: newValue,
                username: spv ? item?.username : session?.username,
                updateDate: spv ? item?.updateDate : new Date()
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            },
            cache: 'no-store'
        })


        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids: {
                    product: `product:${item.slugProduct}`,
                    listProduct: 'data:productList'
                }
            }),
        })

        toast.success('Stok berhasil diupdate')
        setIsSuccess()
        router.refresh()
        setLoadingStockPrice(false)
        setEditStockId(null)
    }

    const savePrice = async (item) => {
        const newValue = Number(priceValue)
        setLoadingStockPrice(true)
        if (Number.isNaN(newValue) || newValue <= 0) {
            setLoadingStockPrice(false)
            setEditPriceId(null)
            return
        }

        if (newValue === item.productPriceFinal) {
            setLoadingStockPrice(false)
            setLoadingStockPrice(true)
            setEditPriceId(null)
            return
        }

        setLoadingStockPrice(true)

        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/c/putPriceProduct`, {
            method: 'PUT',
            body: JSON.stringify({
                slugProduct: item.slugProduct,
                price: newValue,
                username: spv ? item?.username : session?.username,
                updateDate: spv ? item?.updateDate : new Date()
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_SECREET
            },
            cache: 'no-store'
        })

        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids: {
                    product: `product:${item.slugProduct}`,
                    listProduct: 'data:productList'
                }
            }),
        })

        toast.success('Harga berhasil diupdate')
        setIsSuccess()
        router.refresh()
        setLoadingStockPrice(true)
        setEditPriceId(null)
    }


    return (
        <>

            <div className={styles.wrapper}>
                {/* HEADER */}
                <div className={`${styles.row} ${styles.header}`}>
                    <div>Produk</div>
                    <div>Penjualan</div>
                    <div>Stok</div>
                    <div>Harga</div>
                    <div>Selesai</div>
                    <div>Aksi</div>
                </div>
                {/* DATA */}
                {DataProduct?.map((item, index) => {
                    return (
                        <div className={styles.row} key={index}>
                            {/* Produk */}
                            <div className={styles.product}>
                                <Image
                                    width={56}
                                    height={56}
                                    src={item?.imageProductUtama?.secure_url || '/notfoundicon.jpg'}
                                    alt={item?.productName}
                                    className={styles.image}
                                />
                                <div className={styles.productInfo}>
                                    <h4 className={styles.title}>
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_URL2}/product/${item?.slugProduct}`}  // ganti dengan link tujuan produk
                                            target="_blank"
                                            rel="noopener noreferrer"   // aman untuk membuka di tab baru
                                            className={styles.titleLink} // optional styling khusus link
                                        >
                                            <span className={styles.name}
                                                dangerouslySetInnerHTML={{
                                                    __html: item?.highlight?.productName || item?.productName
                                                }}
                                            >
                                            </span>
                                            <span>
                                                <FiExternalLink style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                                            </span>
                                            {/* {item?.productName} */}


                                        </a>
                                    </h4>
                                    <div className={styles.meta}>
                                        <span className={styles.id}>ID: {item?.id}</span>
                                        <span className={styles.dimension}>
                                            Dimensi: {item?.lengthProduct}×{item?.widthProduct}×{item?.heightProduct} cm
                                        </span>
                                        <span className={styles.dimension}>
                                            Berat: {item?.weightProduct} kg
                                        </span>
                                        <span className={styles.dimension}>
                                            Type: {item?.productType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Penjualan */}
                            <div className={styles.center}>
                                <span>{item?.sold} produk terjual</span>
                                <small>Tayang: {item?.viewProduct}</small>
                            </div>

                            {/* ====== STOK ====== */}
                            <div className={styles.center}>
                                {
                                    // editStockId === item.id && isLoadingStockPrice ? <span>Loading...</span>
                                    //     :
                                    editStockId === item.id ? (
                                        <input
                                            type="number"
                                            className={styles.stockInput}
                                            value={stockValue}
                                            autoFocus
                                            onChange={(e) => setStockValue(e.target.value)}
                                            onBlur={() => saveStock(item)} // 👈 klik kiri = SIMPAN
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveStock(item)
                                                if (e.key === 'Escape') setEditStockId(null)
                                            }}
                                        />
                                    ) : (
                                        <span
                                            className={`${styles.bold} ${styles.stockText}`}
                                            style={{ cursor: 'pointer' }}
                                            title="Klik untuk edit stok"
                                            onClick={() => {
                                                setEditStockId(item.id)
                                                setStockValue(item.stockProduct ?? 0)
                                            }}
                                        >
                                            {item?.stockProduct}
                                        </span>
                                    )}
                            </div>

                            {/* ====== HARGA ====== */}
                            <div className={styles.price}>
                                {
                                    editPriceId === item.id && isLoadingStockPrice ? <span>Loading...</span>
                                        :
                                        editPriceId === item.id ? (
                                            <input
                                                type="number"
                                                className={styles.priceInput}
                                                value={priceValue}
                                                autoFocus
                                                onChange={(e) => setPriceValue(e.target.value)}
                                                onBlur={() => savePrice(item)} // 👈 klik kiri = SIMPAN
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') savePrice(item)
                                                    if (e.key === 'Escape') setEditPriceId(null)
                                                }}
                                            />
                                        ) : (
                                            <span
                                                className={styles.normalPrice}
                                                style={{ cursor: 'pointer' }}
                                                title="Klik untuk edit harga"
                                                onClick={() => {
                                                    setEditPriceId(item.id)
                                                    setPriceValue(item.productPriceFinal ?? 0)
                                                }}
                                            >
                                                {FormatRupiah(item?.productPriceFinal)}
                                            </span>
                                        )}
                            </div>


                            {/* Selesai */}
                            <div className={styles.center}>
                                <b>{item?.username} - {item?.username == 'sales01' && 'alma'}{item?.username == 'sales02' && 'sifa'}{item?.username == 'sales03' && 'ina'}{item?.username == 'sales05' && 'dhita'}</b>
                                <span className={styles.time}>
                                    {TimeConverter(item?.updateDate)}
                                </span>
                            </div>

                            {/* Aksi */}
                            <div className={styles.action}>
                                <button className={styles.iconBtn}>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_URL}/${item?.slugProduct}`}  // ganti dengan link tujuan produk
                                        target="_blank"
                                        rel="noopener noreferrer"   // aman untuk membuka di tab baru
                                    >
                                        <FaEdit />
                                    </a>
                                </button>
                                <button onClick={() => AddFormPenawaran(item)} className={styles.iconBtn}>
                                    <FaPlus />
                                </button>
                                {session?.user?.email == 'rio@pelangiteknik.com' &&
                                    <button
                                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                        onClick={() => HandleDeleteProducts(item?.id, item?.slugProduct)}
                                        title="Hapus produk"
                                    >
                                        <FaTrash />
                                    </button>}
                                <div className={styles.switchdelete} >
                                    <label className={styles.switch}>
                                        <input
                                            disabled={loading}
                                            type="checkbox"
                                            checked={!item?.saveDraf}
                                            onChange={() => UpdatePublish(item?.slugProduct, !item?.saveDraf)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div className={styles.pagination}>
                    <button
                        onClick={handlePrev}
                        disabled={loading && currentPage === 1}
                        className={styles.pageBtn}
                    >
                        Prev
                    </button>

                    <span className={styles.pageInfo}>
                        {loading ? 'Loading...' : `Page ${currentPage} of ${totalPages}`}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={loading && currentPage === totalPages}
                        className={styles.pageBtn}
                    >
                        Next
                    </button>
                </div>
            </div>
            {layang &&
                <>
                    <div className={styles.bghitam} onClick={() => setLayang()}></div>
                    <div className={styles.containerupdate}>
                        <FormInput
                            session={session}
                            kondisi={true}
                            data={dataProductDetail}
                            text={'Update Product'}
                            dataKategori={dataKategori} />
                    </div>
                </>}
        </>
    )
}
