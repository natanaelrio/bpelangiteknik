'use client'
import styles from '@/components/headerNew.module.css'
import Link from 'next/link'
import { MdHome, MdLogout } from "react-icons/md";
import { FaBorderAll } from "react-icons/fa";
import { MdOutlineLocalOffer } from "react-icons/md";
import { MdLibraryAdd } from "react-icons/md";
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import Logout from './logout';
import { useCon } from '@/zustand/useCon';
import LoadingNew from './loadingNew';
import Layangpenawaran from './layangpenawaran';
import { signOut } from "next-auth/react"

export default function HeaderNew({ session }) {
    const router = useRouter()
    const setLoading = useCon((state) => state.setLoading)
    const loading = useCon((state) => state.loading)
    const setLayangPenawaran = useCon((state) => state.setLayangPenawaran)
    const layangPenawaran = useCon((state) => state.layangPenawaran)
    const total = JSON.parse(
        localStorage.getItem('DataPenawaran') || '[]'
    ).length;

    const TotalPenawaran = useCon((state) => state.TotalPenawaran) || total

    const [search, setSearch] = useState('')
    const [dataPenawaran, setDataPenawaran] = useState(null)
    const [layang, setLayang] = useState(false)

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
        if (TotalPenawaran > 0) {
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
                <Link href={'/'} className={styles.judul}><MdHome size={30} />PelangiTeknik</Link>

                <Link href={'/order'}> <button className={styles.searchP}>Orders<FaBorderAll />
                </button></Link>

                <Link href={'/penawaran'}> <button className={styles.searchP}>Penawaran  <MdOutlineLocalOffer size={15} />
                </button></Link>

                <Link href={'/post'}> <button className={styles.searchP}>+ Product <MdLibraryAdd />
                </button></Link>
                {session?.user?.email == 'rio@pelangiteknik.com' &&
                    <Link href={'/postartikel'}> <button className={styles.searchP}>+Artikel <MdLibraryAdd />
                    </button></Link>
                }

                <button onClick={handlePenawaran} className={styles.searchP}>+ Buat Penawaran <MdLibraryAdd /> {TotalPenawaran > 0 && <span className={styles.totalP}>{TotalPenawaran}</span>}
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
                        <div className="logout" style={{ cursor: "pointer" }}>
                            {loading ? <LoadingNew /> : <MdLogout size={30} color='red' />}
                        </div>
                    </span>
                </div>
            </div>
            {layangPenawaran && <Layangpenawaran dataPenawaran={dataPenawaran} setDataPenawaran={setDataPenawaran} />}
        </>
    )
}
