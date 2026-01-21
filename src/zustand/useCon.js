import { create } from 'zustand'

export const useCon = create((set) => ({
    layang: false,
    setLayang: () => set((state) => ({ layang: !state.layang })),

    isSuccess: false,
    setIsSuccess: (e) => set((state) => ({ isSuccess: !state.isSuccess })),

    layangPenawaran: false,
    setLayangPenawaran: (value) => set({ layangPenawaran: value }),

    loading: false,
    setLoading: (e) => set((state) => ({ loading: e })),
    // removeAllBears: () => set({ bears: 0 }),

    layangArtikel: false,
    setLayangArtikel: () => set((state) => ({ layangArtikel: !state.layangArtikel })),

    isPenawaran: false,
    setIsPenawaran: (e) => set((state) => ({ isPenawaran: e ? e : !state.isPenawaran })),

    DataPenawaran: [],
    setDataPenawaran: (e) => set((state) => ({ DataPenawaran: e })),

    DataProduct: [],
    setDataProduct: (e) => set((state) => ({ DataProduct: e })),

    TotalPenawaran: 0,
    setTotalPenawaran: (e) => set((state) => ({ TotalPenawaran: e })),

    totalMaxProduct: null,
    setTotalMaxProduct: (e) => set((state) => ({ totalMaxProduct: e })),

    totalProduct: null,
    setTotalProduct: (e) => set((state) => ({ totalProduct: e })),

}))