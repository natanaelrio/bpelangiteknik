'use client'
import styles from '@/components/headerNew.module.css'
import Link from 'next/link'
import { MdHome, MdLogout, MdInfo, MdLibraryBooks } from "react-icons/md";
import { FaBorderAll } from "react-icons/fa";
import { BsHeartPulseFill } from "react-icons/bs";
import { MdOutlineLocalOffer } from "react-icons/md";
import { MdLibraryAdd } from "react-icons/md";
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import Logout from './logout';
import { useCon } from '@/zustand/useCon';
import LoadingNew from './loadingNew';
import Layangpenawaran from './layangpenawaran';
import { signOut } from "next-auth/react"
import { useEffect } from 'react';
import { useSession } from "next-auth/react"
import { getRandomQuote } from '@/utils/motivationalQuotes';

export default function HeaderNew() {

    const { data: session, status } = useSession()
    const router = useRouter()
    const setLoading = useCon((state) => state.setLoading)
    const loading = useCon((state) => state.loading)
    const setLayangPenawaran = useCon((state) => state.setLayangPenawaran)
    const layangPenawaran = useCon((state) => state.layangPenawaran)

    const [total, setTotal] = useState(0);

    useEffect(() => {
        const data = JSON.parse(
            localStorage.getItem('DataPenawaran') || '[]'
        );
        setTotal(data.length);
    }, []);

    const TotalPenawaran = useCon((state) => state.TotalPenawaran) || total

    const [search, setSearch] = useState('')
    const [dataPenawaran, setDataPenawaran] = useState(null)
    const [layang, setLayang] = useState(false)
    const [showModal, setShowModal] = useState(true)
    const [randomQuote, setRandomQuote] = useState('')

    // Set random quote setiap kali modal ditampilkan atau page refresh
    useEffect(() => {
        if (showModal) {
            setRandomQuote(getRandomQuote());
        }
    }, [showModal]);

    const handleSearch = (e) => {
        e.preventDefault()
        setLoading(true)
        router.push('/s/' + search, { scroll: false });
    }

    const handleLogout = () => {
        setLoading(true)
        signOut()
        setLoading(false)
    }

    const handlePenawaran = () => {
        // TotalPenawaran > 0
        if (true) {
            setLoading(true);
            const data = JSON.parse(localStorage.getItem('DataPenawaran') || '[]');
            setDataPenawaran(data);
            setLayangPenawaran(true);
        } else {
            alert('Belum ada data penawaran! Tambahkan produk ke penawaran terlebih dahulu.');
        }
    };


    return (
        <>
            <LoadingNew />
            <div className={styles.atas} >
                <Link href={'/'} className={styles.judul}><MdHome size={28} /><span>PelangiTeknik</span></Link>

                <button className={styles.searchP}>
                    <Link href={'/order'}><FaBorderAll /><span>Orders</span></Link>
                </button>

                <button className={styles.searchP}>
                    <Link href={'/penawaran'}><MdOutlineLocalOffer size={16} /><span>Penawaran</span></Link>
                </button>
                <button className={styles.searchP}>
                    <Link href={'/post'}><MdLibraryAdd size={16} /><span>+ Product</span></Link>
                </button>
                <button className={styles.searchP}>
                    <Link href={'/report'}><MdLibraryBooks size={16} /><span>+ Report</span></Link>
                </button>

                {session?.user?.email == 'rio@pelangiteknik.com' &&
                    <button className={styles.searchP}><Link href={'/postartikel'}><MdLibraryAdd size={16} /><span>+Artikel</span></Link>
                    </button>
                }

                <button onClick={handlePenawaran} className={styles.searchP}><MdLibraryAdd size={16} /><span>Buat Penawaran</span> {TotalPenawaran > 0 && <span className={styles.totalP}>{TotalPenawaran}</span>}
                </button>

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
                        <div className={styles.logout} style={{ cursor: "pointer" }}>
                            {loading ? <LoadingNew /> : 'Logout'}
                        </div>
                    </span>
                </div>
            </div>
            {layangPenawaran && <Layangpenawaran dataPenawaran={dataPenawaran} setDataPenawaran={setDataPenawaran} />}

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalAnimation}>
                            <BsHeartPulseFill className={styles.heartIcon} />
                        </div>
                        <h2 className={styles.modalTitle}>{randomQuote}</h2>
                        <p className={styles.modalSubtitle}>Wellcome Home</p>
                        <button
                            className={styles.modalButton}
                            onClick={() => setShowModal(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
