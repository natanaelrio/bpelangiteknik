import FormInput from "@/components/FormInput";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Login from "@/components/login";

export const dynamic = 'force-dynamic'


export default async function Page() {
    const session = await getServerSession(authOptions)

    return (
        <>
            {session ? <FormInput
                session={session}
            /> : <Login />}
        </>
    )
}

