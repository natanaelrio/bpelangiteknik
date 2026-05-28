'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function SessionDebugger() {
    const { data: session, update } = useSession();
    const [serverSession, setServerSession] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkSession = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/session-check');
            const data = await res.json();
            setServerSession(data);
            console.log('Server session:', data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
        // Check setiap 10 detik
        const interval = setInterval(checkSession, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!session) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: '#f0f0f0',
            border: '1px solid #999',
            padding: 15,
            borderRadius: 8,
            fontSize: 11,
            fontFamily: 'monospace',
            maxWidth: 400,
            maxHeight: 300,
            overflowY: 'auto',
            zIndex: 9999
        }}>
            <div style={{ marginBottom: 10, fontWeight: 'bold', color: '#333' }}>
                📋 Session Debug
            </div>

            <div style={{ marginBottom: 10, color: '#0066cc' }}>
                <strong>Client Session:</strong>
                <pre style={{ margin: '5px 0', background: '#fff', padding: 5, borderRadius: 4 }}>
                    {JSON.stringify({
                        user: session?.user,
                        role: session?.role,
                        perusahaan: session?.perusahaan,
                        username: session?.username
                    }, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: 10, color: '#006600' }}>
                <strong>Server Session:</strong>
                <pre style={{ margin: '5px 0', background: '#fff', padding: 5, borderRadius: 4 }}>
                    {serverSession ? JSON.stringify(serverSession.session, null, 2) : 'Loading...'}
                </pre>
            </div>

            <button
                onClick={() => {
                    update();
                    checkSession();
                }}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#1a5490',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 'bold'
                }}
            >
                🔄 Refresh Session
            </button>
        </div>
    );
}
