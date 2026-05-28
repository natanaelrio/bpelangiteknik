'use client'
import { SessionProvider, useSession } from 'next-auth/react'
import { useSessionRefresh } from './useSessionRefresh'
import { SessionDebugger } from '@/components/SessionDebugger'

// Component untuk wrap session refresh hook
function SessionRefreshWrapper({ children }) {
    useSessionRefresh();
    return children;
}

export default function Provider({ children, session }) {
    return (
        <SessionProvider session={session}>
                <SessionRefreshWrapper>
                {children}
            </SessionRefreshWrapper>
            {/* Debug component - hanya tampil di development */}
            {/* {process.env.NODE_ENV === 'development' && <SessionDebugger />} */}
        </SessionProvider>
    )
}
