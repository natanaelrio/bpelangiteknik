'use client'
import styles from '@/components/artikelNew.module.css'
import { HandleDetailArtikel } from '@/service/artikel/handleDetail';
import { HandleDrafArtikel } from '@/service/artikel/handleDraf';
import { useCon } from '@/zustand/useCon'
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react'
import toast from 'react-hot-toast';
import { MdDeleteOutline } from "react-icons/md";

const FormInputArtikel = dynamic(() => import('@/components/FormInputArtikel'), {
    loading: () => <p>Loading Form...</p>, // Optional: loading state while the component is being loaded
    ssr: false // Disable server-side rendering for this component
});

export default function ArtikelNew({ session, dataArtikel, dataKategoriArtikel, dataTagsArtikel }) {
    const router = useRouter()
    const setLayangArtikel = useCon((state) => state.setLayangArtikel)
    const layangArtikel = useCon((state) => state.layangArtikel)
    const setLoading = useCon((state) => state.setLoading)
    const [dataArtikelUpdate, setDataArtikelUpdate] = useState(null)

    const GetDetailProductArtikel = async (id) => {
        setLoading(true)
        try {
            const data = await HandleDetailArtikel(id)
            setDataArtikelUpdate(data?.data)
            setLoading(false)
            setLayangArtikel()
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
    return (

        <>
            <>
                {/* ARTIKEL */}
                {session?.user?.email === 'rio@pelangiteknik.com' && (
                    <div className={styles.bottomContainer}>
                        <table className={styles.productTable}>
                            <thead className={styles.productTableHead}>
                                <tr>
                                    <th>Judul Artikel</th>
                                    <th>Publish</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className={styles.productTableBody}>
                                {dataArtikel?.map((artikel, index) => (
                                    <tr key={index}>
                                        <td onClick={() => GetDetailProductArtikel(artikel?.slug)}>
                                            {artikel?.title}
                                        </td>
                                        <td style={{ width: '100px' }}>
                                            <label className={styles.switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={!artikel?.saveDraf}
                                                    onChange={() =>
                                                        UpdatePublishArtikel(artikel?.slug, !artikel?.saveDraf)
                                                    }
                                                />
                                                <span className={styles.slider}></span>
                                            </label>
                                        </td>
                                        <td
                                            style={{ width: '50px' }}
                                            className={styles.deleteIcon}
                                            onClick={() => HandleDeleteArtikels(artikel?.id)}
                                        >
                                            <MdDeleteOutline size={30} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* MODAL OVERLAY */}
                        {layangArtikel && (
                            <>
                                <div
                                    className={styles.overlay}
                                    onClick={() => setLayangArtikel()}
                                ></div>
                                <div className={styles.modalContainer}>
                                    <FormInputArtikel
                                        kondisi={true}
                                        data={dataArtikelUpdate}
                                        dataKategori={dataKategoriArtikel}
                                        dataTagsArtikel={dataTagsArtikel}
                                        dataArtikel={dataArtikel}
                                        text={"Update Artikel"}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </>

        </>
    )
}
