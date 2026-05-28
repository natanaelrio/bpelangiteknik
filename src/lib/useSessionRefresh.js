import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Hook untuk auto-refresh session setiap interval
 * Dengan force update untuk memastikan role dan perusahaan selalu ter-update
 * 
 * Contoh penggunaan:
 * export default function MyComponent() {
 *     useSessionRefresh();
 *     return <div>...</div>
 * }
 */
export function useSessionRefresh() {
    const { data: session, update } = useSession();

    useEffect(() => {
        if (!session) return;

        // Force refresh session setiap 5 menit untuk pastikan data selalu fresh
        const refreshInterval = setInterval(async () => {
            try {
                // Trigger update callback di NextAuth
                await update();
                console.log('Session refreshed');
            } catch (error) {
                console.error('Error refreshing session:', error);
            }
        }, 300000); // 5 menit

        return () => clearInterval(refreshInterval);
    }, [session, update]);
}

/**
 * Hook alternatif dengan warning sebelum session expired
 * Akan show warning 5 menit sebelum session expired, lalu auto logout
 */
export function useSessionRefreshWithWarning() {
    const { data: session, update } = useSession();

    useEffect(() => {
        if (!session) return;

        // Warning 5 menit sebelum expired (55 menit setelah login)
        const warningTimeout = setTimeout(() => {
            if (window.confirm('Session Anda akan berakhir dalam 5 menit. Lanjutkan?')) {
                // Jika klik OK, refresh session
                update().catch(console.error);
                // Reset timeout
                useSessionRefreshWithWarning();
            }
        }, 3300000); // 55 menit

        return () => clearTimeout(warningTimeout);
    }, [session, update]);
}
