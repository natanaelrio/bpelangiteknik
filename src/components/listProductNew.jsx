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

const FormInput = dynamic(() => import('@/components/FormInput'), {
    loading: () => <p>Loading Form...</p>, // Optional: loading state while the component is being loaded
    ssr: false // Disable server-side rendering for this component
});
const FormInputArtikel = dynamic(() => import('@/components/FormInputArtikel'), {
    loading: () => <p>Loading Form...</p>, // Optional: loading state while the component is being loaded
    ssr: false // Disable server-side rendering for this component
});

export default function ListProductNew({ session, query, dataKategori, }) {
    // console.log('ARTIKELLL', dataArtikel);
    const UserSPV = session?.user?.email === 'rio@pelangiteknik.com'
    const pathname = usePathname()
    const router = useRouter()
    const KondisiPencarian = pathname.startsWith('/s/')
    const searchParams = useSearchParams()
    const m = searchParams.get('m')

    const setLayang = useCon((state) => state.setLayang)
    const layang = useCon((state) => state.layang)
    const setLayangArtikel = useCon((state) => state.setLayangArtikel)
    const layangArtikel = useCon((state) => state.layangArtikel)
    const setIsPenawaran = useCon((state) => state.setIsPenawaran)
    const isPenawaran = useCon((state) => state.isPenawaran)
    const setDataPenawaran = useCon((state) => state.setDataPenawaran)
    const DataPenawaran = useCon((state) => state.DataPenawaran)
    const DataProduct = useCon((state) => state.DataProduct)
    const totalMaxProduct = useCon((state) => state.totalMaxProduct)
    const totalProduct = useCon((state) => state.totalProduct)
    const setDataProduct = useCon((state) => state.setDataProduct)
    const setTotalMaxProduct = useCon((state) => state.setTotalMaxProduct)
    const setTotalProduct = useCon((state) => state.setTotalProduct)
    const setLoading = useCon((state) => state.setLoading)
    const loading = useCon((state) => state.loading)
    const setTotalPenawaran = useCon((state) => state.setTotalPenawaran)


    const [editStockId, setEditStockId] = useState(null);
    const [stockValue, setStockValue] = useState('');
    const [dataFilterMerek, setDataFilterMerek] = useState([])
    const [take, setTake] = useState(1)

    const [editPriceId, setEditPriceId] = useState(null);
    const [priceValue, setPriceValue] = useState('');
    const [dataProductDetail, setDataProductDetail] = useState(null)
    const [dataArtikelUpdate, setDataArtikelUpdate] = useState(null)
    const [search, setSearch] = useState(query)
    const [dataSlugUpdatePublish, setDataAtaSlugUpdatePublish] = useState(null)
    const [dataSlugProduct, setDataSlugProduct] = useState(null)
    const [kategori, setKategori] = useState(true)

    const ITEMS_PER_PAGE = 5;

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(totalMaxProduct / ITEMS_PER_PAGE);

    // const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    // const endIndex = startIndex + ITEMS_PER_PAGE;

    // const currentData = DataProduct.slice(startIndex, endIndex);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
        setLoading(true)
    };

    const handleNext = () => {
        if (currentPage < totalMaxProduct) setCurrentPage(prev => prev + 1);
        if (currentPage < totalMaxProduct) setTake(take + 1)
        setLoading(true)
    };

    useEffect(() => {
        try {
            const fetchDataFilter = async () => {
                const res = await GetFilterProduct()
                setDataFilterMerek(res)
            }
            fetchDataFilter()
            const fetchDataShop = async () => {
                const res = await GetListProduct(take, 5, m, query)
                setLoading(false)
                setTotalMaxProduct(res?.totalMaxProduct)
                setTotalProduct(res?.totalProduct)
                setDataProduct(res?.data)
            }
            fetchDataShop()
        }
        catch (e) {
            console.log(e)
        }
    }, [take, m, search, dataSlugUpdatePublish, dataSlugProduct, loading])


    const GetDetailProduct = async (id) => {
        setLoading(true)
        try {
            setLayang()
            const data = await handleDetailProduct(id)
            setDataProductDetail(data?.data[0])
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

        // ambil data lama
        const existing = JSON.parse(
            localStorage.getItem('DataPenawaran') || '[]'
        );

        // cek id sudah ada atau belum
        const isExist = existing.some(
            (item) => item.id === data.id
        );

        if (isExist) {
            alert('Produk sudah ada di penawaran');
            return;
        }

        // tambah data
        const updated = [...existing, data];

        // simpan ke localStorage
        localStorage.setItem(
            'DataPenawaran',
            JSON.stringify(updated)
        );

        updateTotal(); // ← realtime
        // optional: update state
        // setDataPenawaran(updated);
    };


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
                {DataProduct?.map((item, index) => (
                    <div className={styles.row} key={index}>
                        {/* Produk */}
                        <div className={styles.product}>
                            <Image
                                width={56}
                                height={56}
                                src={item?.imageProductUtama?.secure_url}
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
                                        {item?.productName} <FiExternalLink style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
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
                                </div>
                            </div>
                        </div>

                        {/* Penjualan */}
                        <div className={styles.center}>
                            <span>{item?.sold} produk terjual</span>
                            <small>Tayang: {item?.viewProduct}</small>
                        </div>

                        {/* Stok */}
                        <div className={styles.center}>
                            {editStockId === item.id ? (
                                <input
                                    type="number"
                                    className={styles.stockInput}
                                    value={stockValue}
                                    autoFocus
                                    onChange={(e) => setStockValue(e.target.value)}
                                    onBlur={() => setEditStockId(null)}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            // SIMPAN KE API DI SINI
                                            setLoading(true)
                                            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
                                                method: 'DELETE',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    ids: {
                                                        product: `product:${item.slugProduct || 'abcdefghijklmnopzrefekekwkwk'}`,
                                                    },
                                                }),
                                            })
                                            await UpdateStockProduct({
                                                slugProduct: item.slugProduct,
                                                stockProduct: stockValue,
                                                username: session?.username
                                            })
                                            toast.success('Stok berhasil diupdate')
                                            setLoading(false)
                                            console.log('Save stock:', stockValue);
                                            setEditStockId(null);
                                        }
                                    }}
                                />
                            ) : (
                                <span
                                    className={`${styles.bold} ${styles.stockText}`}
                                    onClick={() => {
                                        setEditStockId(item.id);
                                        setStockValue(item.stockProduct);
                                    }}
                                >
                                    {item?.stockProduct}
                                </span>
                            )}
                        </div>

                        {/* Harga */}
                        <div className={styles.price}>
                            {editPriceId === item.id ? (
                                <input
                                    type="number"
                                    className={styles.priceInput}
                                    value={priceValue}
                                    autoFocus
                                    onChange={(e) => setPriceValue(e.target.value)}
                                    onBlur={() => setEditPriceId(null)}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            setLoading(true)
                                            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
                                                method: 'DELETE',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    ids: {
                                                        product: `product:${item.slugProduct || 'abcdefghijklmnopzrefekekwkwk'}`,
                                                    },
                                                }),
                                            })
                                            await UpdatePriceProduct({
                                                slugProduct: item.slugProduct,
                                                price: priceValue,
                                                username: session?.username
                                            })
                                            toast.success('Harga berhasil diupdate')
                                            setLoading(false)
                                            console.log('save price', priceValue);
                                            setEditPriceId(null);
                                        }
                                    }}
                                />
                            ) : (
                                <span
                                    className={styles.normalPrice}
                                    onClick={() => {
                                        setEditPriceId(item.id);
                                        setPriceValue(item.productPriceFinal);
                                    }}
                                    title="Klik untuk edit harga"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {FormatRupiah(item?.productPriceFinal)}
                                </span>
                            )}
                        </div>

                        {/* Selesai */}
                        <div className={styles.center}>
                            <b>{item?.username} - {item?.username == 'sales01' && 'alma'}{item?.username == 'sales02' && 'sifa'}{item?.username == 'sales03' && 'ina'} </b>
                            <span className={styles.time}>
                                {TimeConverter(item?.updateDate)}
                            </span>
                        </div>

                        {/* Aksi */}
                        <div className={styles.action}>
                            <button onClick={() => GetDetailProduct(item?.slugProduct)} className={styles.iconBtn}>
                                <FaEdit />
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
                        </div>
                    </div>
                ))}
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
                            kondisi={true}
                            data={dataProductDetail}
                            text={'Update Product'}
                            dataKategori={dataKategori} />
                    </div>
                </>}
        </>
    )
}
