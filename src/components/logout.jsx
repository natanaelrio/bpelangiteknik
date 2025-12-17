import { signIn, signOut } from "next-auth/react"
import { MdLogout } from "react-icons/md";

export default function Logout() {
    return (
        <div className="logout" onClick={() => signOut()} style={{ cursor: "pointer" }}>
            <MdLogout size={30} color='red' />
        </div>
    )
}
