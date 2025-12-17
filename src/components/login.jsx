'use client'
import { signIn, signOut } from "next-auth/react"
import styles from '@/components/login.module.css'
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const res = await signIn("credentials",
                {
                    redirect: false,
                    email: email,
                    password: password
                }
            )
            if (!res?.error) {
                router.push('/')
                router.refresh()
                toast.success('Successfully Login! ')
                setLoading(false)
            } else {
                toast.error("Failed Login");
                setLoading(false)
            }
        } catch (err) {
            console.log(err);
        }
        setLoading(false)
    };

    return (
        <div className={styles.loginContainer}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className={styles.loginBtn}>{loading ? 'Loading...' : 'Login'}</button>
            </form>
        </div>
    );
};

