import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ReportHistory from "@/components/reportHistory/reportHistory";

export const dynamic = 'force-dynamic'

export default async function ReportHis() {
    const session = await getServerSession(authOptions)

    return (
        <ReportHistory session={session} />
    )
}

