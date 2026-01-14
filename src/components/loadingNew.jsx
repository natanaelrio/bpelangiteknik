import { useCon } from '@/zustand/useCon'
import LottieAnimation from '@/utils/LottieAnimation';
import styles from '@/components/LoadingNew.module.css'
export default function LoadingNew() {

    const loading = useCon((state) => state.loading)
    return (
        <>
            {loading && <div className={styles.animasiloading}></div>}
            {
                loading && <div className={styles.animasidalam}>
                    <div className={styles.gambarloading}>
                        <LottieAnimation animationPath={`${process.env.NEXT_PUBLIC_URL}/rocket.json`} />
                    </div>
                    <div className={styles.textloading}>
                        Wwkwkwkwk Loading.... Tunggu...
                    </div>
                </div>
            }
        </>
    )
}
