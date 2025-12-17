import redis from "@/controllers/redis";

export async function DELETE(req) {
    try {
        const { ids } = await req.json();

        // Ambil semua key dari object ids
        const keys = Object.values(ids);

        // 🔹 Cek isi semua key sebelum dihapus
        const existingValues = await Promise.all(keys.map((key) => redis.get(key)));

        // Filter key yang benar-benar ada di Redis
        const validKeys = keys.filter((_, i) => existingValues[i]);

        if (validKeys.length === 0) {
            return Response.json({
                success: false,
                message: "Tidak ada key valid yang ditemukan di Redis",
            });
        }

        // 🔹 Hapus semua key sekaligus
        const deletedCount = await redis.del(...validKeys);

        return Response.json({
            success: true,
            deletedCount,
            deletedKeys: validKeys,
            beforeDelete: Object.fromEntries(validKeys.map((k, i) => [k, existingValues[i]])),
        });
    } catch (err) {
        console.error("Redis DELETE error:", err);
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}
