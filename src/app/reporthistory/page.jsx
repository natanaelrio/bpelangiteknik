import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ReportHistory from "@/components/reportHistory/ReportHistory";

export const dynamic = 'force-dynamic'

export default async function ReportHistoryPage() {
    const session = await getServerSession(authOptions)

    return (
        <ReportHistory session={session} />
    )
}

