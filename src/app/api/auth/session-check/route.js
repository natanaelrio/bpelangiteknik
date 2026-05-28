import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return Response.json({
                status: 401,
                message: 'No session',
                session: null
            });
        }

        console.log('Session on server:', session);

        return Response.json({
            status: 200,
            message: 'Session data',
            session: {
                user: session.user,
                id: session.id,
                email: session.email,
                username: session.username,
                role: session.role,
                perusahaan: session.perusahaan,
                expires: session.expires
            }
        });
    } catch (error) {
        console.error('Error checking session:', error);
        return Response.json({
            status: 500,
            message: 'Error checking session',
            error: error.message
        });
    }
}
