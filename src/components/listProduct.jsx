'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

// Icons
import { MdHome, MdOutlineSimCardDownload, MdDeleteOutline, MdLibraryAdd, FaBorderAll, MdOutlineLocalOffer, IoIosArrowDropright } from 'react-icons/md'

// Utils & Services
import { FormatRupiah } from '@/utils/formatRupiah'
import { TimeConverter } from '@/utils/formatMoment'
import { handleDetailProduct } from '@/service/handleDetailProduct'
import { HandleDraf } from '@/service/handleDraf'
import { HandleDrafArtikel } from '@/service/artikel/handleDraf'
import { HandleDetailArtikel } from '@/service/artikel/handleDetail'
import { HandleDeleteArtikel } from '@/service/artikel/handleDelete'
import { HandleDeleteProduct } from '@/service/handleDeleteProduct'
import { GetListProduct, GetFilterProduct, GetProduct } from '@/service/n'

// Components
import { useCon } from '@/zustand/useCon'
import Logout from '@/components/logout'
import Penawaran from '@/components/penawaran'
import LoadingList from '@/components/skleton/skletonList'

import styles from '@/components/listProduct.module.css'

// Dynamic imports
const FormInput = dynamic(() => import('@/components/FormInput'), {
    loading: () => <p>Loading Form...</p>,
    ssr: false
})

// Constants
const SALES_NAMES = {
    'sales01': 'alma',
    'sales02': 'sifa',
    'sales03': 'ina',
    'sales05': 'dhita'
}

const ADMIN_EMAIL = 'rio@pelangiteknik.com'

// ================================
// Product Card Component
// ================================
function ProductCard({ data, userSPV, onUpdatePublish, onDelete, onGetDetail, onPenawaran }) {
    return (
        <article className={styles.kotak}>
            <header className={styles.indiatas}>
                <div className={styles.username}>
                    <strong>
                        {data.username} - {SALES_NAMES[data.username] || data.username}
                    </strong>
                    <time dateTime={data?.start}>{TimeConverter(data?.start)}</time>
                </div>
                <div className={styles.switchdelete}>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={!data?.saveDraf}
                            onChange={() => onUpdatePublish(data?.slugProduct, !data?.saveDraf)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                    {userSPV && (
                        <button
                            onClick={() => onDelete(data?.id, data?.slugProduct)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--colormain)',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            title="Delete Product"
                        >
                            <MdDeleteOutline size={30} />
                        </button>
                    )}
                </div>
            </header>

            <div onClick={() => onGetDetail(data?.slugProduct)} style={{ cursor: 'pointer' }}>
                <a href={`/product/${data?.slugProduct}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <figure>
                        <div className={styles.gambarbawah}>
                            <Image
                                src={data?.imageProductUtama?.secure_url}
                                alt={data?.productName}
                                width={250}
                                height={250}
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </figure>

                    <div className={styles.detailproduct}>
                        <div className={styles.plt}>
                            <span>Dimensi: </span>
                            {data?.lengthProduct || data?.widthProduct || data?.heightProduct
                                ? `${data?.lengthProduct}cm x ${data?.widthProduct}cm x ${data?.heightProduct}cm`
                                : <span style={{ color: 'red' }}>Belum Ada Dimensi</span>
                            }
                        </div>
                        <div className={styles.berat}>
                            <span>Berat:</span> {data?.weightProduct}kg
                        </div>
                    </div>

                    <div className={styles.name}>
                        {data?.fMerek?.map((brand, idx) => (
                            <div key={idx} className={styles.merek}>
                                {brand?.name || 'Belum ada Merek'}
                            </div>
                        ))}
                    </div>
                    <div className={styles.name}>
                        {data?.productName}
                    </div>

                    <div className={styles.price}>
                        {FormatRupiah(Number(data?.productPriceFinal))}
                    </div>
                </a>
            </div>

            <footer className={styles.bawahdetail}>
                <button className={styles.penawaran} onClick={() => onPenawaran(data)}>
                    <MdOutlineSimCardDownload />
                    <span>&nbsp;Surat Penawaran</span>
                </button>

                <button className={styles.penawaran} onClick={() => onGetDetail(data?.slugProduct)}>
                    Edit Product
                </button>
            </footer>
        </article>
    )
}

// ================================
// Load More Button Component
// ================================
function LoadMoreButton({ onClick, loading, isTop = false }) {
    return (
        <div className={styles.kotak} onClick={onClick}>
            <div className={styles.loadmore}>
                <div style={{ transform: isTop ? 'rotate(-95deg)' : 'rotate(0)' }}>
                    <IoIosArrowDropright size={40} />
                </div>
                <div>
                    {loading ? 'Loading...' : isTop ? 'Kembali Ke atas' : 'Load More'}
                </div>
            </div>
        </div>
    )
}

// ================================
// Loading Overlay Component
// ================================
function LoadingOverlay({ loading }) {
    if (!loading) return null
    
    return (
        <div className={styles.loading}>
            <div className={styles.kotak}>
                LOADING...
            </div>
            <div className={styles.kotakmelayang}></div>
        </div>
    )
}

// ================================
// Update Modal Component
// ================================
function UpdateModal({ layang, loading, setLayang, data, dataKategori, text }) {
    if (!layang || loading) return null

    return (
        <>
            <div className={styles.bghitam} onClick={() => setLayang()}></div>
            <div className={styles.containerupdate}>
                <FormInput
                    kondisi={true}
                    data={data}
                    text={text}
                    dataKategori={dataKategori} />
            </div>
        </>
    )
}

// ================================
// Navigation Bar Component
// ================================
function NavigationBar({ session, onSetLoading }) {
    const isAdmin = session?.user?.email === ADMIN_EMAIL

    return (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
            <Link href={'/'} className={styles.judul}>
                <MdHome size={30} />
                <span>PelangiTeknik</span>
            </Link>

            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <Link href={'/order'} onClick={() => onSetLoading(true)}>
                    <button className={styles.searchP}>
                        <FaBorderAll style={{ marginRight: '6px' }} />
                        Orders
                    </button>
                </Link>

                <Link href={'/penawaran'} onClick={() => onSetLoading(true)}>
                    <button className={styles.searchP}>
                        <MdOutlineLocalOffer style={{ marginRight: '6px' }} />
                        Penawaran
                    </button>
                </Link>

                <Link href={'/post'} onClick={() => onSetLoading(true)}>
                    <button className={styles.searchP}>
                        <MdLibraryAdd style={{ marginRight: '6px' }} />
                        + Product
                    </button>
                </Link>

                {isAdmin && (
                    <Link href={'/postartikel'} onClick={() => onSetLoading(true)}>
                        <button className={styles.searchP}>
                            <MdLibraryAdd style={{ marginRight: '6px' }} />
                            +Artikel
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    )
}

// ================================
// Search Bar Component
// ================================
function SearchBar({ search, onSearchChange, onSubmit, onLogout }) {
    return (
        <div className={styles.ataskanan}>
            <div className={styles.search}>
                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => onSearchChange(e.target.value)}
                        value={search}
                    />
                    <button className={styles.searchB} type="submit">Search</button>
                </form>
            </div>
            <span onClick={onLogout}>
                <Logout />
            </span>
        </div>
    )
}

// ================================
// Articles Table Component
// ================================
function ArticlesTable({ articles, onUpdatePublish, onDelete, onGetDetail }) {
    if (!articles?.length) return null

    return (
        <table className={styles.producttable}>
            <thead>
                <tr>
                    <th>Judul Artikel</th>
                    <th>Publish</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {articles.map((artikel, index) => (
                    <tr key={index}>
                        <td onClick={() => onGetDetail(artikel?.slug)}>
                            {artikel?.title}
                        </td>
                        <td style={{ width: '100px' }}>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={!artikel?.saveDraf}
                                    onChange={() => onUpdatePublish(artikel?.slug, !artikel?.saveDraf)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </td>
                        <td style={{ width: '50px', cursor: 'pointer', color: 'var(--colormain)' }} onClick={() => onDelete(artikel?.id)}>
                            <MdDeleteOutline size={30} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

// ================================
// Main Component
// ================================
export default function ListProduct({ session, dataList, query, dataKategori, dataArtikel, dataKategoriArtikel, dataTagsArtikel }) {
    // Router & Navigation
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const KondisiPencarian = pathname.startsWith('/s/')
    const m = searchParams.get('m')

    // User check
    const isAdmin = session?.user?.email === ADMIN_EMAIL

    // Zustand store
    const setLayang = useCon((state) => state.setLayang)
    const layang = useCon((state) => state.layang)
    const setLayangArtikel = useCon((state) => state.setLayangArtikel)
    const layangArtikel = useCon((state) => state.layangArtikel)
    const setIsPenawaran = useCon((state) => state.setIsPenawaran)
    const isPenawaran = useCon((state) => state.isPenawaran)
    const setDataPenawaran = useCon((state) => state.setDataPenawaran)
    const DataPenawaran = useCon((state) => state.DataPenawaran)

    // Local state
    const [dataProduct, setDataProduct] = useState([])
    const [take, setTake] = useState(1)
    const [totalMaxProduct, setTotalMaxProduct] = useState(null)
    const [totalProduct, setTotalProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [dataArtikelUpdate, setDataArtikelUpdate] = useState(null)
    const [search, setSearch] = useState(query)
    const [dataSlugUpdatePublish, setDataAtaSlugUpdatePublish] = useState(null)
    const [dataSlugProduct, setDataSlugProduct] = useState(null)

    // ================================
    // Data Fetching
    // ================================
    useEffect(() => {
        const fetchDataShop = async () => {
            try {
                const res = await GetListProduct(take, 7, m, query)
                setLoading(false)
                setTotalMaxProduct(res?.totalMaxProduct)
                setTotalProduct(res?.totalProduct)
                setDataProduct(res?.data)
            } catch (e) {
                console.log(e)
            }
        }
        fetchDataShop()
    }, [take, m, search, dataSlugUpdatePublish, dataSlugProduct])

    // ================================
    // Handlers
    // ================================
    const GetDetailProduct = useCallback(async (id) => {
        setLoading(true)
        try {
            setLayang()
            const data = await handleDetailProduct(id)
            setData(data?.data[0])
            setLoading(false)
        } catch {
            setLoading(false)
            toast.error(`Error Internet`)
        }
    }, [setLayang])

    const GetDetailProductArtikel = useCallback(async (id) => {
        setLoading(true)
        try {
            setLayangArtikel()
            const data = await HandleDetailArtikel(id)
            setDataArtikelUpdate(data?.data)
            setLoading(false)
        } catch {
            setLoading(false)
            toast.error(`Error Internet`)
        }
    }, [setLayangArtikel])

    const UpdatePublish = useCallback(async (slug, draf) => {
        setLoading(true)
        try {
            await HandleDraf(slug, draf)
            setLoading(false)
            setDataAtaSlugUpdatePublish(draf)
            toast.success('Successfully!')
        } catch {
            setLoading(false)
            toast.error(`Error Internet`)
        }
    }, [])

    const UpdatePublishArtikel = useCallback(async (slug, draf) => {
        setLoading(true)
        try {
            await HandleDrafArtikel(slug, draf)
            setLoading(false)
            toast.success('Successfully!')
        } catch {
            setLoading(false)
            toast.error(`Error Internet`)
        }
        router.refresh()
    }, [router])

    const handleSearch = useCallback((e) => {
        e.preventDefault()
        setLoading(true)
        router.push(`/s/${search}`, { scroll: false })
    }, [router, search])

    const HandleDeleteProducts = useCallback(async (id, slug) => {
        if (!confirm('Apakah yakin hapus?')) return
        
        setLoading(true)
        try {
            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: { product: `product:${slug || 'abcdefghijklmnopzrefekekwkwk'}` },
                }),
            })
            await HandleDeleteProduct(slug)
            setLoading(false)
            setDataSlugProduct(slug)
            toast.success('Successfully!')
        } catch {
            setLoading(false)
            toast.error(`Error Internet`)
        }
    }, [])

    const HandleDeleteArtikels = useCallback(async (id) => {
        if (!confirm('Apakah yakin hapus?')) return
        
        setLoading(true)
        try {
            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/redis`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: {
                        blogMeta: `blogMeta:${id || 'abcdefghijklmnopzrefekekwkwk'}`,
                        blog: `blog:${id || 'abcdefghijklmnopzrefekekwkwk'}`,
                    },
                }),
            })
            await HandleDeleteArticle(id)
            setLoading(false)
            toast.success('Successfully!')
        } catch {
            setLoading(false)
            toast.error(`Error Internet`)
        }
    }, [])

    const handleLogout = useCallback(() => {
        setLoading(true)
    }, [])

    const HandleTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const HandlePenawaran = useCallback(async (e) => {
        setLoading(true)
        try {
            const dataku = await GetProduct(e.slugProduct)
            setDataPenwaan(dataku[0])
            setIsPenawaran()
            setLoading(false)
        } catch {
            setLoading(false)
            setIsPenawaran()
        }
    }, [setDataPenawaran, setIsPenwaan])

    const HandleLoadMore = useCallback(() => {
        setLoading(true)
        setTake(prev => prev + 1)
    }, [])

    // ================================
    // Render
    // ================================
    return (
        <>
            <div className="mobile">hanya digunakan di laptop/komputer</div>
            <div className="desktop">
                <div className={styles.container}>
                    {isPenawaran && <Penawaran data={DataPenawaran} />}
                    
                    <div className={styles.dalamcontainer}>
                        {/* Header Section */}
                        <header className={styles.atas} style={{ zIndex: loading ? 0 : 99 }}>
                            <NavigationBar 
                                session={session} 
                                onSetLoading={setLoading} 
                            />
                            <SearchBar 
                                search={search}
                                onSearchChange={setSearch}
                                onSubmit={handleSearch}
                                onLogout={handleLogout}
                            />
                        </header>

                        {/* Main Content */}
                        <main className={styles.bawah}>
                            <section className={styles.listproduct}>
                                <div className={styles.grid}>
                                    {dataProduct?.length ? (
                                        <>
                                            {dataProduct.map((item, i) => (
                                                <ProductCard
                                                    key={i}
                                                    data={item}
                                                    userSPV={isAdmin}
                                                    onUpdatePublish={UpdatePublish}
                                                    onDelete={HandleDeleteProducts}
                                                    onGetDetail={GetDetailProduct}
                                                    onPenwaan={HandlePenawaran}
                                                />
                                            ))}
                                            
                                            {/* Load More / Back to Top */}
                                            {totalProduct > totalMaxProduct ? (
                                                <LoadMoreButton onClick={HandleTop} isTop />
                                            ) : (
                                                <LoadMoreButton onClick={HandleLoadMore} loading={loading} />
                                            )}
                                        </>
                                    ) : (
                                        query == undefined ? <LoadingList /> : `tidak ada product ${query}`
                                    )}
                                </div>
                            </section>
                        </main>

                        {/* Articles Section - Admin Only */}
                        {isAdmin && (
                            <section className={styles.bawah}>
                                <ArticlesTable
                                    articles={dataArtikel}
                                    onUpdatePublish={UpdatePublishArtikel}
                                    onDelete={HandleDeleteArtikels}
                                    onGetDetail={GetDetailProductArtikel}
                                />
                                {KondisiPencarian && !dataList.length && <div>Data Tidak ada</div>}
                            </section>
                        )}
                    </div>

                    {/* Loading Overlay */}
                    <LoadingOverlay loading={loading} />

                    {/* Update Product Modal */}
                    <UpdateModal
                        layang={layang}
                        loading={loading}
                        setLayang={setLayang}
                        data={data}
                        dataKategori={dataKategori}
                        text={'Update Product'}
                    />

                    {/* Update Artikel Modal */}
                    {layangArtikel && !loading && (
                        <>
                            <div className={styles.bghitam} onClick={() => setLayangArtikel()}></div>
                            <div className={styles.containerupdate}>
                                <FormInput
                                    kondisi={true}
                                    data={dataArtikelUpdate}
                                    dataKategori={dataKategoriArtikel}
                                    dataTagsArtikel={dataTagsArtikel}
                                    dataArtikel={dataArtikel}
                                    text={'Update Artikel'} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}