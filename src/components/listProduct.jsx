'use client'

import styles from '@/components/listProduct.module.css'
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { FormatRupiah } from '@/utils/formatRupiah';
import { HandleDraf } from '@/service/handleDraf'
import { MdHome } from "react-icons/md";
import { MdOutlineSimCardDownload } from "react-icons/md";
import { IoIosArrowDropright } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { MdLibraryAdd } from "react-icons/md";
import { FaBorderAll } from "react-icons/fa";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useCon } from '@/zustand/useCon';
import toast from 'react-hot-toast';
import Logout from '@/components/logout';
import Penawaran from '@/components/penawaran';
import LoadingList from '@/components/skleton/skletonList';
import { handleDetailProduct } from '@/service/handleDetailProduct';
import { HandleDrafArtikel } from '@/service/artikel/handleDraf';
import { HandleDetailArtikel } from '@/service/artikel/handleDetail';
import { HandleDeleteArtikel } from '@/service/artikel/handleDelete';
import { HandleDeleteProduct } from '@/service/handleDeleteProduct';
import { useSearchParams } from 'next/navigation'
import { GetListProduct, GetFilterProduct, GetProduct } from "@/service/n";

import dynamic from 'next/dynamic';
import { TimeConverter } from '@/utils/formatMoment';

const FormInput = dynamic(() => import('@/components/FormInput'), {
    loading: () => <p>Loading Form...</p>, // Optional: loading state while the component is being loaded
    ssr: false // Disable server-side rendering for this component
});
const FormInputArtikel = dynamic(() => import('@/components/FormInputArtikel'), {
    loading: () => <p>Loading Form...</p>, // Optional: loading state while the component is being loaded
    ssr: false // Disable server-side rendering for this component
});


export default function ListProduct({ session, dataList, query, dataKategori, dataArtikel, dataKategoriArtikel, dataTagsArtikel }) {

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


    const [dataProduct, setDataProduct] = useState([])
    const [dataFilterMerek, setDataFilterMerek] = useState([])
    const [take, setTake] = useState(1)
    const [totalMaxProduct, setTotalMaxProduct] = useState(null)
    const [totalProduct, setTotalProduct] = useState(null)

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [dataArtikelUpdate, setDataArtikelUpdate] = useState(null)
    const [search, setSearch] = useState(query)
    const [dataSlugUpdatePublish, setDataAtaSlugUpdatePublish] = useState(null)
    const [dataSlugProduct, setDataSlugProduct] = useState(null)
    const [kategori, setKategori] = useState(true)

    useEffect(() => {
        try {
            const fetchDataFilter = async () => {
                const res = await GetFilterProduct()
                setDataFilterMerek(res)
            }
            fetchDataFilter()

            const fetchDataShop = async () => {
                const res = await GetListProduct(take, 7, m, query)
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
    }, [take, m, search, dataSlugUpdatePublish, dataSlugProduct])


    const GetDetailProduct = async (id) => {
        setLoading(true)
        try {
            setLayang()
            const data = await handleDetailProduct(id)
            setData(data?.data[0])
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

    const UpdatePublish = async (slug, draf) => {
        setLoading(true)
        try {
            await HandleDraf(slug, draf)
            setLoading(false)
            setDataAtaSlugUpdatePublish(draf)
            toast.success('Successfully!')
        } catch {
            setLoading(false)
            toast.error(`Error Internet`);
        }

    }
    const UpdatePublishArtikel = async (slug, draf) => {
        setLoading(true)
        try {
            await HandleDrafArtikel(slug, draf)
            setLoading(false)
            toast.success('Successfully!')
        } catch {
            setLoading(false)
            toast.error(`Error Internet`);
        }
        router.refresh()
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setLoading(true)
        router.push(`/s/${search}`, { scroll: false })
        // localStorage.setItem('searchLocal', search)
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

    const HandleDeleteArtikels = async (e) => {
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
                            blogMeta: `blogMeta:${slug || 'abcdefghijklmnopzrefekekwkwk'}`,
                            blog: `blog:${slug || 'abcdefghijklmnopzrefekekwkwk'}`,
                        },
                    }),
                });
                await HandleDeleteArtikel(e)
                setLoading(false)
            } catch {
                setLoading(false)
                toast.error(`Error Internet`);
            }
            toast.success('Successfully!')
        } else {
            // Do nothing!
            console.log('Thing was not saved to the database.');
        }
    }

    const handleKategori = () => {
        setKategori(!kategori)
    }


    const HandleLoadMore = () => {
        setLoading(true)
        setTake(take + 1)
    }

    const handleLogout = () => {
        setLoading(true)
    }

    const HandleTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }


    const HandlePenawaran = async (e) => {
        setLoading(true)
        try {
            const dataku = await GetProduct(e.slugProduct)
            setDataPenawaran(dataku[0])
            setIsPenawaran()
            setLoading(false)
        }
        catch {
            setLoading(false)
            setIsPenawaran()
        }

    }

    const HandleFillter = async (id, e) => {
        pathname == '/' && router.push(`/?${id == 'idM' && `m=${e}`}`)
        KondisiPencarian && router.push(`/s/${search}?${id == 'idM' && `m=${e}`}`)
        // baseCategory == '/category/' && router.push(`${pathname}?${id == 'idM' && `m=${e}`}`)
        pathname == '/shop' && router.push(`/shop?${id == 'idM' && `m=${e}`}`)
    }

    const HandleCloseFillter = async (id) => {
        pathname == '/' && router.push(`/?${id == 'idM' && `m=${''}`}`)
        KondisiPencarian && router.push(`/s/${search}?${id == 'idM' && `m=${''}`}`)
        // baseCategory == '/category/' && router.push(`${pathname}?${id == 'idM' && `m=${''}`}`)
        pathname == '/shop' && router.push(`/shop?${id == 'idM' && `m=${''}`}`)
    }

    return (
        <>
            <div className="mobile">hanya digunakan di laptop/komputer</div>
            <div className="desktop">

                <div className={styles.container}>
                    {isPenawaran && <Penawaran data={DataPenawaran} />}
                    <div className={styles.dalamcontainer}>
                        <div className={styles.atas} style={{ zIndex: loading ? 0 : 99 }}>
                            <Link href={'/'} className={styles.judul}><MdHome size={30} />PelangiTeknik</Link>

                            <Link href={'/order'} onClick={() => setLoading(true)}> <button className={styles.searchP}>Orders<FaBorderAll />
                            </button></Link>

                            <Link href={'/penawaran'} onClick={() => setLoading(true)}> <button className={styles.searchP}>Penawaran  <MdOutlineLocalOffer size={15} />
                            </button></Link>

                            <Link href={'/post'} onClick={() => setLoading(true)}> <button className={styles.searchP}>+ Product <MdLibraryAdd />
                            </button></Link>
                            {session?.user?.email == 'rio@pelangiteknik.com' &&
                                <Link href={'/postartikel'} onClick={() => setLoading(true)}> <button className={styles.searchP}>+Artikel <MdLibraryAdd />
                                </button></Link>
                            }

                            <div className={styles.ataskanan}>
                                <div className={styles.search}>
                                    <form onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            onChange={(e) => setSearch(e.target.value)}
                                            value={search}
                                        />

                                        <button className={styles.searchB} type="submit">Search</button>
                                    </form>
                                </div>
                                <span onClick={handleLogout}>
                                    <Logout />
                                </span>
                            </div>
                        </div>

                        <div className={styles.bawah}>
                            {/* {
                                <div className={styles.filter}>
                                    <div className={styles.dalamfilter}>
                                        <div className={styles.judul} onClick={handleKategori}>
                                            <div className={styles.text}>Merek</div>
                                            <div className={styles.icon}><CiFilter /></div>
                                        </div>
                                        {m ?
                                            <div className={styles.filternya}>
                                                <div className={styles.box}>{m}</div>
                                                <div className={styles.close} onClick={() => HandleCloseFillter('idM')}>x</div>
                                            </div> :
                                            kategori &&
                                            <div className={styles.kategori}>
                                                {dataFilterMerek?.map((data, i) => {
                                                    if (!data?.name) return null; // Sembunyikan jika nama kosong
                                                    return (
                                                        <div className={styles.list} key={i} onClick={(e) => HandleFillter('idM', data?.name)}>
                                                            <label className={styles.checkboxLabel}>
                                                                <input
                                                                    type="checkbox"
                                                                    className={styles.checkbox}
                                                                    onChange={(e) => HandleFillter('idM', data?.name, e.target.checked)}
                                                                />
                                                                <span className={styles.text}>{data?.name}
                                                                    {!KondisiPencarian && `(` + `${data._count.Merek}` + `)`}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                        }
                                    </div>
                                </div>
                            } */}
                            <div className={styles.listproduct}>
                                <div className={styles.grid}>
                                    {dataProduct?.length ?
                                        dataProduct?.map((data, i) => {
                                            return (
                                                <div key={i} className={styles.kotak}>
                                                    <div className={styles.indiatas}>
                                                        <div className={styles.username}>
                                                            <b> {data.username} - {data.username == 'sales01' && 'alma'}{data.username == 'sales02' && 'sifa'}{data.username == 'sales03' && 'ina'} </b>
                                                            <br />
                                                            {TimeConverter(data?.start)}
                                                        </div>
                                                        <div className={styles.switchdelete} >
                                                            <label className={styles.switch}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!data?.saveDraf}
                                                                    onChange={() => UpdatePublish(data?.slugProduct, !data?.saveDraf)}
                                                                />
                                                                <span className={styles.slider}></span>
                                                            </label>
                                                            {UserSPV && <div style={{ width: '30px', cursor: 'pointer', color: 'var(--colormain)' }} onClick={() => HandleDeleteProducts(data?.id, data?.slugProduct)}><MdDeleteOutline size={30} /></div>}

                                                        </div>
                                                    </div>

                                                    <div onClick={() => GetDetailProduct(data?.slugProduct)}>
                                                        <div href={`/product/${data?.slugProduct}`}>
                                                            <div className={styles.gambarbawah}>
                                                                <Image
                                                                    src={data?.imageProductUtama?.secure_url}
                                                                    alt={data?.productName}
                                                                    width={250}
                                                                    height={250}
                                                                >
                                                                </Image>

                                                            </div>
                                                            <div className={styles.detailproduct}>
                                                                <div className={styles.plt}><span>Dimensi: </span>{data?.lengthProduct || data?.widthProduct || data?.heightProduct ? data?.lengthProduct + 'cm' + ' x ' + data?.widthProduct + 'cm' + ' x ' + data?.heightProduct + 'cm' : <span style={{ color: 'red' }}>'Belum Ada Dimensi'</span>}</div>
                                                                <div className={styles.berat}><span> Berat:</span> {data?.weightProduct}kg</div>
                                                            </div>
                                                            <div className={styles.name}>
                                                                {data?.fMerek?.map((data) => {
                                                                    return (
                                                                        <div className={styles.merek}>
                                                                            {data?.name ? data?.name : 'Belum ada Merek'}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                            <div className={styles.name}>
                                                                {data?.productName}
                                                            </div>

                                                            <div className={styles.price}>
                                                                {FormatRupiah(Number(data?.productPriceFinal))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.bawahdetail}>
                                                        <div className={styles.penawaran} onClick={() => HandlePenawaran(data)} >
                                                            <MdOutlineSimCardDownload /> &nbsp;Surat Penawaran</div>

                                                        <div className={styles.penawaran} onClick={() => GetDetailProduct(data?.slugProduct)}>Edit Product</div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                        : query == undefined ? <LoadingList /> : `tidak ada product ${query}`}
                                    {Boolean(dataProduct?.length) &&
                                        totalProduct > totalMaxProduct ?
                                        <div className={styles.kotak} onClick={HandleTop}>
                                            <div className={styles.loadmore}>
                                                <div style={{ transform: 'rotate(-95deg)' }}>
                                                    <IoIosArrowDropright size={40} />
                                                </div>
                                                <div>
                                                    Kembali Ke atas
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        Boolean(dataProduct?.length) && <div className={styles.kotak} onClick={HandleLoadMore}>
                                            <div className={styles.loadmore}>
                                                <div>
                                                    <IoIosArrowDropright size={40} />
                                                </div>
                                                <div>
                                                    {loading ? 'Loading...' : 'Load More'}
                                                </div>
                                            </div>
                                        </div>
                                    }

                                </div>
                            </div>
                        </div>

                        {/* //PRODUCT */}


                        {/* ARTIKEL */}
                        {session?.user?.email == 'rio@pelangiteknik.com' &&
                            <div className={styles.bawah}>
                                <table
                                    className={styles.producttable}>
                                    <thead>
                                        <tr>
                                            <th>Judul Artikel</th>
                                            <th>Publish</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataArtikel?.map((artikel, index) => {

                                            return (<tr key={index} >
                                                <td onClick={() => GetDetailProductArtikel(artikel?.slug)}>{artikel?.title}</td>
                                                <td style={{ width: '100px' }}>
                                                    <label className={styles.switch}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!artikel?.saveDraf}
                                                            onChange={() => UpdatePublishArtikel(artikel?.slug, !artikel?.saveDraf)}
                                                        />
                                                        <span className={styles.slider}></span>
                                                    </label>
                                                </td>
                                                <td style={{ width: '50px', cursor: 'pointer', color: 'var(--colormain)' }} onClick={() => HandleDeleteArtikels(artikel?.id)}><MdDeleteOutline size={30} /></td>
                                            </tr>)
                                        }
                                        )}
                                    </tbody>
                                </table>

                                {KondisiPencarian && !dataList.length && <div>Data Tidak ada</div>}
                            </div>
                        }
                    </div>


                    {
                        loading ?
                            <div className={styles.loading}>
                                <div className={styles.kotak} >
                                    LOADING...
                                </div>
                                <div className={styles.kotakmelayang}>

                                </div>
                            </div> :
                            layang &&
                            <>
                                <div className={styles.bghitam} onClick={() => setLayang()}></div>
                                <div className={styles.containerupdate}>
                                    <FormInput
                                        kondisi={true}
                                        data={data}
                                        text={'Update Product'}
                                        dataKategori={dataKategori} />
                                </div>
                            </>
                    }
                    {
                        loading ?
                            <div className={styles.loading}>
                                <div className={styles.kotak} >
                                    LOADING...
                                </div>
                            </div> :
                            layangArtikel &&
                            <>
                                <div className={styles.bghitam} onClick={() => setLayangArtikel()}></div>
                                <div className={styles.containerupdate}>
                                    <FormInputArtikel
                                        kondisi={true}
                                        data={dataArtikelUpdate}
                                        dataKategori={dataKategoriArtikel}
                                        dataTagsArtikel={dataTagsArtikel}
                                        dataArtikel={dataArtikel}
                                        text={'Update Artikel'} />
                                </div>
                            </>
                    }
                </div >
            </div>
        </>
    )
}
