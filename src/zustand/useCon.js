import { create } from 'zustand'

export const useCon = create((set) => ({
    layang: false,
    setLayang: () => set((state) => ({ layang: !state.layang })),
    // removeAllBears: () => set({ bears: 0 }),

    layangArtikel: false,
    setLayangArtikel: () => set((state) => ({ layangArtikel: !state.layangArtikel })),

    isPenawaran: false,
    setIsPenawaran: (e) => set((state) => ({ isPenawaran: e ? e : !state.isPenawaran })),

    DataPenawaran: {},
    setDataPenawaran: (e) => set((state) => ({ DataPenawaran: e })),
}))