// import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authOptions = {
    session: {
        strategy: "jwt"
    },
    providers: [
        Credentials({
            credentials: {
                email: {
                    label: "Email",
                    type: "Email",
                    placeholder: "example"
                },
                password: {
                    label: "password",
                    type: "password",
                }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null

                const users = [
                    { id: "1", email: "sales01@pelangiteknik.com", password: "sales01pelangi", username: "sales01" },
                    { id: "2", email: "sales02@pelangiteknik.com", password: "sales02pelangi", username: "sales02" },
                    { id: "3", email: "sales03@pelangiteknik.com", password: "sales03pelangi", username: "sales03" },
                    { id: "4", email: "sales04@pelangiteknik.com", password: "sales04pelangi", username: "sales04" },
                    { id: "5", email: "rio@pelangiteknik.com", password: "rio12345", username: "rio" },
                ];

                // Cari pengguna berdasarkan email dan password
                const user = users.find(
                    (u) => u.email === credentials.email && u.password === credentials.password
                );

                if (!user) {
                    return null; // Jika tidak ditemukan, kembalikan null
                }

                // Jika ditemukan, kembalikan data pengguna
                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                };
            }
        }
        )
    ], callbacks: {
        jwt({ token, user }) {
            if (!user) return token
            return { ...token, id: user.id, username: user.username }
        },
        session({ session, token }) {
            return {
                ...session,
                id: token.id,
                email: token.email,
                username: token.username,
            }
        }
    },
    pages: {
        signIn: "/"
    }

}