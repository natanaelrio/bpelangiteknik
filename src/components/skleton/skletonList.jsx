'use client'
import styles from '@/components/listProduct.module.css'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function LoadingList() {
    return (
        <>
            {Array(5).fill().map((_, index) => (
                <div className={styles.kotak} key={index}>
                    {/* Variasi ukuran skeleton gambar produk */}
                    <Skeleton height={200} width={150} />

                    {/* Variasi ukuran skeleton judul produk */}
                    <Skeleton height={20} width={120} style={{ margin: '10px 0' }} />

                    {/* Variasi jumlah dan ukuran skeleton deskripsi produk */}
                    <Skeleton height={15} width={170} style={{ marginBottom: '10px' }} />

                    {/* Skeleton untuk harga produk */}
                    <Skeleton height={15} width={100} />
                </div>
            ))}
        </>
    )
}
