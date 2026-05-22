'use client'
import styles from '@/components/listPesanan.module.css'
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import moment from 'moment';
import 'moment/locale/id'
import { UpdateDataPesanan } from '@/service/handlePutDataPesanan';
import BeatLoader from "react-spinners/BeatLoader";
import Link from 'next/link';
import { FormatRupiah } from '@/utils/formatRupiah';
import { Fragment } from 'react';
import { GetNotaPesanan } from '@/service/handleGetNotaPesanan';
import LogoAtas from '@/components/logo/logoAtas';
import TTD from '@/components/logo/ttd';
import toast from 'react-hot-toast';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DeleteDataPesanan, GetDataPesanan, RetrieveDataPesanan } from '@/service/handleGetDataPesanan';
import Image from 'next/image';
import { FaShippingFast } from "react-icons/fa";
export default function ListPesanan({ session, data, month, year, payment }) {


    const result = data.data.filter(item => item.payment === true);
    const total = result.reduce((sumAll, datae, indexDatae) => {
        // total sebelum diskon
        const totalBeforeDiscount = datae.dataPesananItems.reduce((sumItems, item) => {
            return sumItems + (item.priceOriginal * item.quantity);
        }, 0);

        let totalAfterDiscount;
        if (datae.diskon) {
            totalAfterDiscount = totalBeforeDiscount - (totalBeforeDiscount * datae.diskon / 100);
        } else if (datae.diskon_nominal) {
            totalAfterDiscount = totalBeforeDiscount - datae.diskon_nominal;
        } else {
            totalAfterDiscount = totalBeforeDiscount;
        }

        return sumAll + totalAfterDiscount;
    }, 0);

    const UserSPV = session?.user?.email === 'rio@pelangiteknik.com'
    const searchParams = useSearchParams();
    const logoBase64 = LogoAtas()
    const logoTTD = TTD()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [iditem, setIDitem] = useState('')
    const [idItemResi, setIDitemResi] = useState('')
    const [resi, setResi] = useState('')
    const [openResi, setOpenResi] = useState(false)
    const [expandedOrder, setExpandedOrder] = useState(null)

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(prev => prev === orderId ? null : orderId)
    }

    const handleSaveTracking = async (id) => {
        setLoading(true)
        console.log(id);
        await UpdateDataPesanan({
            id: id,
            noResi: resi,
        })
        router.refresh()
        setLoading(false)
        setOpenResi(false)
    }

    const handleTrackingNumberChange = (id, value) => {
        setOpenResi(true)
        setIDitemResi(id)
    }
    const handleStatusChange = async (newStatus, pesanan) => {
        try {
            const items = pesanan?.dataPesananItems || []

            const fetchData = async () => {
                await Promise.all(
                    items.map(item =>
                        UpdateDataPesanan({
                            id: item.id,
                            status: newStatus
                        })
                    )
                )
            }

            await toast.promise(
                fetchData(),
                {
                    loading: 'Loading ganti status...',
                    success: <b>Semua status berhasil diupdate!</b>,
                    error: <b>Gagal update, coba lagi</b>,
                }
            )

            router.refresh()
        } catch (err) {
            console.error(err)
        }
    }


    const HandleNota = async (e) => {
        const fetchData = async () => {
            const dataNota = await GetNotaPesanan(e)
            const dataUser = dataNota?.data[0]

            const wkkwkw = dataUser.dataPesananItems.map((data) => {
                return (
                    [
                        { text: data.productName, style: "colorproduct" },
                        { text: data.quantity, style: "subheader" },
                        { text: FormatRupiah(Number(data.priceOriginal)), style: "subheader" },
                        { text: data.note == 'ongkir' ? 0 + '%' : dataUser?.diskon ? dataUser?.diskon + '%' : 0 + '%', style: "subheader" },
                        { text: FormatRupiah(Number((data.priceOriginal - ((data.priceOriginal * data.quantity) * dataUser?.diskon) / 100) * data.quantity)), style: "subheader" },
                    ]
                )
            })

            const totalPriceOngkir = dataUser.dataPesananItems.filter(item => item?.note == "ongkir").map((data) => {
                return (
                    data.priceOriginal * data.quantity
                )
            }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)


            const totalPrice = dataUser.dataPesananItems.filter(item => item?.note !== "ongkir").map((data) => {
                return (
                    data.priceOriginal * data.quantity
                )
            }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)


            const totalQuantity = dataUser.dataPesananItems.map((data) => {
                return (
                    data.quantity
                )
            }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)


            const docDefinitionv = {
                content: [
                    {
                        columns: [
                            {
                                image: logoBase64, // Menyisipkan gambar logo
                                width: 220, // Ukuran logo
                                alignment: 'left', // Posisi logo
                            },
                            {
                                stack: [
                                    {
                                        text: "INVOICE",
                                        style: "atasLogo",
                                        alignment: "right",
                                    },
                                    { text: dataUser.merchantOrderId, style: 'atasLogo', alignment: 'right' },
                                ],
                            }
                        ],
                    },
                    { text: '\n' },
                    { text: '\n' },
                    {
                        columns: [
                            {
                                stack: [
                                    { text: "DITERBITKAN ATAS NAMA", style: "atas" },
                                    { text: "Penjual: PT PELANGI TEKNIK INDONESIA", style: "subheader" },
                                    { text: `Kode    :` + ` ${dataUser?.kode ? dataUser?.kode : "NOVOUCHER"}`, style: "subheader" }
                                ]
                            },
                            {
                                table: {
                                    widths: [80, "auto", "auto"], // Sesuaikan lebar kolom
                                    body: [
                                        [
                                            { text: "UNTUK", bold: true, style: "textinformasi" },
                                            { text: "", style: "textinformasi" },
                                            { text: "", style: "textinformasi" }
                                        ],
                                        [
                                            { text: "Pembeli", style: "textinformasi" },
                                            { text: ":", style: "textinformasi" },
                                            { text: `${dataUser.nama_lengkap_user}`, style: "subheaderB" }
                                        ],
                                        [
                                            { text: "Tanggal Pembelian", style: "textinformasi" },
                                            { text: ":", style: "textinformasi" },
                                            { text: `${new Date(dataUser.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, style: "subheaderB" }
                                        ],
                                        [
                                            { text: "Alamat Pengiriman", style: "textinformasi" },
                                            { text: ":", style: "textinformasi" },
                                            {
                                                text: `${dataUser.alamat_lengkap_user}`,
                                                style: "subheaderB"
                                            }
                                        ],
                                        [
                                            { text: "Catatan", style: "textinformasi" },
                                            { text: ":", style: "textinformasi" },
                                            {
                                                text: `${dataUser.catatan_pengiriman ? dataUser.catatan_pengiriman : '-'} `,
                                                style: "subheaderB"
                                            }
                                        ],
                                    ],
                                },
                                layout: "noBorders",
                                margin: [0, 5, 0, 15],
                            },
                        ],
                    },
                    { text: '\n' },
                    { text: '\n' },
                    {
                        table: {
                            widths: ["*", "auto", "auto", "auto", "auto"],
                            body: [
                                [
                                    { text: "Info Produk", style: "tableHeader" },
                                    { text: "Jumlah", style: "tableHeader" },
                                    { text: "Harga Satuan", style: "tableHeader" },
                                    { text: "Diskon", style: "tableHeader" },
                                    { text: "Total Harga", style: "tableHeader" },
                                ], ...wkkwkw,
                                [
                                    { text: 'TOTAL TAGIHAN', style: "tableHeader" },
                                    { text: totalQuantity, style: "subheader" },
                                    { text: '', style: "subheader" },
                                    { text: '', style: "subheader" },
                                    { text: FormatRupiah(Number(Number(totalPriceOngkir + totalPrice - (totalPrice * (dataUser?.diskon ? dataUser?.diskon : 0)) / 100))), style: "subheader" },
                                ]
                            ],
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return 0.5; // Ketebalan garis horizontal
                            },
                            vLineWidth: function (i, node) {
                                return 0.5; // Ketebalan garis vertikal
                            },
                            hLineColor: function (i, node) {
                                return 'gray'; // Warna garis horizontal
                            },
                            vLineColor: function (i, node) {
                                return 'gray'; // Warna garis vertikal
                            },
                        },
                    },
                    { text: '\n' },
                    { text: '\n' },
                    { text: 'Salam,', style: 'ttd', alignment: 'right' },
                    {
                        image: logoTTD, // Menyisipkan gambar logo
                        width: 150, // Ukuran logo
                        alignment: 'right', // Posisi logo
                        // style: 'gambarlogo'
                    },
                    { text: `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, style: 'defaultStyle', style: 'ttd2', alignment: 'right' },
                    { text: '\n' },
                    { text: '\n' },
                    {
                        text: "Invoice ini sah dan diproses oleh komputer.\nSilakan hubungi PelangiTeknik.com Care apabila kamu membutuhkan bantuan.",
                        style: "footer",
                        margin: [0, 50, 0, 0],
                    },
                ],
                styles: {
                    header: {
                        fontSize: 9,
                        bold: true,
                    },
                    textinformasi: {
                        marginBottom: -3,
                        fontSize: 9,
                        whiteSpace: "nowrap", // Mencegah teks melompat ke baris baru
                        overflow: "hidden", // Mencegah teks meluber
                        textOverflow: "ellipsis", // Tambahkan "..." jika teks terlalu panjang
                    },
                    subheader: {
                        fontSize: 9,
                    },
                    atas: {
                        marginTop: 10,
                        fontSize: 9,
                        bold: true,
                    },
                    subheaderB: {
                        marginBottom: -3,
                        fontSize: 9,
                        bold: true,
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 9,
                        color: "black",
                    },
                    colorproduct: {
                        bold: true,
                        fontSize: 9,
                        color: '#152f66',
                    },
                    footer: {
                        fontSize: 7,
                        color: "gray",
                    }, ttd: {
                        fontSize: 9,
                        bold: true,
                        marginLeft: 70,
                        marginRight: 70,
                    },
                    ttd2: {
                        fontSize: 9,
                        bold: true,
                        marginRight: 30,
                    },
                },
                background: {
                    text: 'LUNAS', // Tulisan watermark
                    color: '#152f66', // Warna teks
                    opacity: 0.1, // Transparansi teks (0.1 untuk sangat transparan)
                    bold: true, // Membuat teks tebal
                    fontSize: 140, // Ukuran teks besar
                    alignment: 'center', // Posisi teks di tengah horizontal
                    margin: [0, 200, 0, 0] // Posisi vertikal watermark
                },
            };

            pdfMake.createPdf(docDefinitionv).download(`NOTA - ${dataUser.merchantOrderId} - ${dataUser.nama_lengkap_user}.pdf`);
        }

        toast.promise(
            fetchData(),
            {
                loading: 'Wait! lagi buatin Nota :)',
                success: <b>Berhasil didownload</b>,
                error: <b>Try again</b>,
            }
        );
    }
    const HandleMonth = (newMonth) => {
        const currentYear = searchParams.get("year") || year;
        // const currentPayment = searchParams.get("payment") || "";
        router.push(`/order/?month=${newMonth}&year=${currentYear}`, { scroll: false });
        router.refresh();
        toast.success('terupdate yachh😍...')
    };

    const HandleYear = (newYear) => {
        const currentMonth = searchParams.get("month") || month;
        const currentPayment = searchParams.get("payment") || "";
        router.push(`/order/?month=${currentMonth}&year=${newYear}`, { scroll: false });
        router.refresh();
        toast.success('terupdate yachh😍...')
    };

    const HandlePayment = (newPayment) => {
        const currentMonth = searchParams.get("month") || month;
        const currentYear = searchParams.get("year") || year;
        router.push(`/order/?month=${currentMonth}&year=${currentYear}&payment=${newPayment}`, { scroll: false });
        router.refresh();
        toast.success('terupdate yachh😍...')
    };

    const [deletePesanan, setDeletePesanan] = useState(false)
    const HandleDeleteOrder = async (e) => {
        const confirmDelete = confirm("Yakin ingin menghapus pesanan ini?");
        if (!confirmDelete) return; // kalau user batal, stop fungsi
        setDeletePesanan(true);
        await DeleteDataPesanan(e);
        setDeletePesanan(false);
        router.refresh();
    };
    const HandleRetrieveOrder = async (e) => {
        console.log(e);

        const confirmRetrieve = confirm("Yakin ingin mengambil kembali pesanan ini?");
        if (!confirmRetrieve) return; // kalau user batal, stop fungsi
        setDeletePesanan(true);
        await RetrieveDataPesanan(e);
        setDeletePesanan(false);
        router.refresh();
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.filtercontrols}>
                    <select value={month} onChange={e => HandleMonth(Number(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={year}
                        onChange={e => HandleYear(Number(e.target.value))}
                        className="year-input"
                    />

                    <button onClick={() => HandlePayment(true)} className={styles.atasb}>Berhasil dibayar</button>
                    <button onClick={() => HandlePayment(false)} className={styles.atasb}>Belum dibayar</button>
                </div>
                {loading ? 'Loading...' :
                    <>
                        <div className={styles.totalpesanan}>
                            {payment == null && "" || payment == 'false' && 'Belum Bayar ' || payment == 'true' && 'Sudah Bayar '}{data.totalCart} Invoice | Close {FormatRupiah(total)}
                        </div>
                        <div className={styles.dalamcontainer}>
                            <div className={styles.bawah}>
                                <table className={styles.orderTable}>
                                    <thead>
                                        <tr>
                                            <th>Data Transaksi</th>
                                            {UserSPV && <th>Delete</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <Fragment >
                                            {data?.data?.map((pesanan, j) => {
                                                console.log(pesanan.nota_url)

                                                const items = pesanan?.dataPesananItems || []
                                                const productItems = items.filter(item => item.note !== 'ongkir')
                                                const shippingItems = items.filter(item => item.note === 'ongkir')
                                                const previewItems = productItems.slice(0, 2)
                                                const moreCount = Math.max(productItems.length - previewItems.length, 0)
                                                const previewText = previewItems.map(item => item.productName).join(', ') + (moreCount > 0 ? ` + ${moreCount} lainnya` : '')
                                                const totalProductCount = productItems.reduce((sum, item) => sum + item.quantity, 0)
                                                const totalBeforeDiscount = items.reduce((sum, item) => sum + (item.priceOriginal * item.quantity), 0)
                                                let totalAfterDiscount = totalBeforeDiscount
                                                if (pesanan.diskon) {
                                                    totalAfterDiscount = totalBeforeDiscount - (totalBeforeDiscount * pesanan.diskon / 100)
                                                } else if (pesanan.diskon_nominal) {
                                                    totalAfterDiscount = totalBeforeDiscount - pesanan.diskon_nominal
                                                }
                                                const orderTotalValue = FormatRupiah(totalAfterDiscount)
                                                const shippingItem = shippingItems[0]
                                                const paymentStatusText = pesanan?.payment ? 'Sudah Bayar' : 'Belum Bayar'
                                                const uniqueStatuses = [...new Set(productItems.map(item => item.status).filter(Boolean))]
                                                const selectValue = uniqueStatuses.length === 1 ? uniqueStatuses[0] : ""
                                                const statusSummaryText = uniqueStatuses.join(', ') || 'Belum Diproses'
                                                const noteSummaryText = shippingItems.length > 0
                                                    ? `${shippingItems.length} ongkir item${shippingItems.length > 1 ? 's' : ''}`
                                                    : pesanan?.catatan_pengiriman || '-'
                                                const expanded = expandedOrder === pesanan.id

                                                return (
                                                    <Fragment key={j}>
                                                        <tr className={styles.summaryRow}>
                                                            <td>
                                                                <div className={styles.transactionSummary}>
                                                                <div className={styles.transactionInfoBlock}>
                                                                    <div className={styles.transactionInfoHeader}>
                                                                        <div>
                                                                            <div className={styles.orderPreviewText}>
                                                                                {previewText || 'Pesanan belum memiliki produk.'}
                                                                            </div>
                                                                            <div className={styles.orderPreviewMeta}>
                                                                                <span>{totalProductCount} item</span>
                                                                                <span>{orderTotalValue}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className={styles.transactionInfoActions}>
                                                                            {pesanan?.payment && (
                                                                                <span className={`${styles.paymentBadge} ${styles.paymentBadgeInfo}`}>
                                                                                    {JSON.parse(pesanan?.payment_info)?.channel?.toUpperCase()} - {JSON.parse(pesanan?.payment_info)?.method?.toUpperCase()}
                                                                                </span>
                                                                            )}
                                                                            <span className={`${styles.paymentBadge} ${pesanan?.payment ? styles.paymentBadgePaid : styles.paymentBadgeUnpaid}`}>
                                                                                {paymentStatusText}
                                                                            </span>
                                                                            {pesanan?.payment && pesanan?.nota_url && (
                                                                                <Link
                                                                                    href={`https://` + pesanan.nota_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className={styles.primaryButton}
                                                                                >
                                                                                    Buka Nota
                                                                                </Link>
                                                                            )}
                                                                            <button
                                                                                type="button"
                                                                                className={styles.secondaryButton}
                                                                                onClick={() => toggleOrderDetails(pesanan.id)}
                                                                            >
                                                                                {expanded ? 'Sembunyikan detail' : 'Lihat detail'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className={styles.infoRow}>
                                                                        <span className={styles.infoLabel}>ID:</span>
                                                                        <span className={styles.infoValue}>{pesanan?.merchantOrderId}</span>
                                                                    </div>
                                                                    <div className={styles.infoRow}>
                                                                        <span className={styles.infoLabel}>Tanggal:</span>
                                                                        <span className={styles.infoValue}>{moment((pesanan?.start).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).format('DD MMM YYYY')}</span>
                                                                    </div>
                                                                    <div className={styles.infoRow}>
                                                                        <span className={styles.infoLabel}>Status:</span>
                                                                        <select
                                                                            className={`${styles.statusSelect} ${selectValue === 'Selesai' ? styles.statusSelectPaid : selectValue === 'Dikirim' ? styles.statusSelectShipped : selectValue === 'Diproses' ? styles.statusSelectPending : ''}`}
                                                                            value={selectValue}
                                                                            onChange={(e) => handleStatusChange(e.target.value, pesanan)}
                                                                        >
                                                                            <option value="">Belum Diproses</option>
                                                                            <option value="Diproses">Diproses</option>
                                                                            <option value="Dikirim">Dikirim</option>
                                                                            <option value="Selesai">Selesai</option>
                                                                        </select>
                                                                    </div>
                                                                    {selectValue === "Dikirim" && shippingItem && (
                                                                        <div className={styles.infoRow}>
                                                                            <span className={styles.infoLabel}>{shippingItem.productName}:</span>
                                                                            {!openResi && (
                                                                                <button onClick={() => handleTrackingNumberChange(shippingItem?.id)} className={styles.noteButtonSmall}>
                                                                                    {shippingItem?.noResi ? shippingItem?.noResi : 'Tambahkan Resi'}
                                                                                </button>
                                                                            )}
                                                                            {openResi && idItemResi === shippingItem?.id && (
                                                                                <div className={styles.noresi}>
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="Masukkan nomor resi"
                                                                                        value={resi}
                                                                                        onChange={(e) => setResi(e.target.value)}
                                                                                        disabled={loading}
                                                                                    />
                                                                                    <button disabled={loading} onClick={() => handleSaveTracking(shippingItem?.id)}>
                                                                                        {idItemResi === shippingItem?.id && loading
                                                                                            ? 'Loading'
                                                                                            : shippingItem?.noResi
                                                                                                ? 'Update'
                                                                                                : 'Simpan'}
                                                                                    </button>
                                                                                    <div className={styles.close} onClick={() => setOpenResi(false)}>x</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            </td>
                                                        </tr>

                                                        {expanded && (
                                                            <div className={styles.modalOverlay} onClick={() => setExpandedOrder(null)}>
                                                                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                                                    <div className={styles.modalHeader}>
                                                                        <h2>Detail Pesanan</h2>
                                                                        <button 
                                                                            className={styles.modalClose}
                                                                            onClick={() => setExpandedOrder(null)}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                    <div className={styles.modalBody}>
                                                                        <div className={styles.orderDetailGrid}>
                                                                            <div className={styles.orderDetailColumn}>
                                                                                <h4 className={styles.detailHeading}>Produk</h4>
                                                                                <ul className={styles.listitem}>
                                                                                    <div className={styles.itemproduk}>
                                                                                        {productItems.map((item, k) => {
                                                                                            const isOngkir = item?.note === 'ongkir'
                                                                                            const priceAfterDiscount = isOngkir
                                                                                                ? item.price
                                                                                                : item.price - (item.price * pesanan.diskon) / 100

                                                                                            return (
                                                                                                <li key={k} className={styles.containeritemWrapper}>
                                                                                                    <div className={styles.itemWrapper}>
                                                                                                        <div className={styles.itemImage}>
                                                                                                            {item?.image ? (
                                                                                                                <Link
                                                                                                                    target="_blank"
                                                                                                                    href={`${process.env.NEXT_PUBLIC_URL2}/product/${item.slugProduct}`}
                                                                                                                >
                                                                                                                    <Image
                                                                                                                        src={item.image}
                                                                                                                        width={60}
                                                                                                                        height={60}
                                                                                                                        alt={item.productName || ""}
                                                                                                                        unoptimized
                                                                                                                    />
                                                                                                                </Link>
                                                                                                            ) : <FaShippingFast size={30} />}
                                                                                                        </div>
                                                                                                        <div className={styles.itemDetails}>
                                                                                                            <Link
                                                                                                                target="_blank"
                                                                                                                href={`${process.env.NEXT_PUBLIC_URL2}/product/${item.slugProduct}`}
                                                                                                                className={styles.itemLink}
                                                                                                            >
                                                                                                                {item.productName}
                                                                                                                {item?.note && (
                                                                                                                    <span className={styles.itemNote}> ({item.note})</span>
                                                                                                                )}
                                                                                                            </Link>

                                                                                                            <div className={styles.itemMeta}>
                                                                                                                <span>Qty: {item.quantity}x</span>
                                                                                                                <span>Harga: {FormatRupiah(item.price)}</span>
                                                                                                                {!isOngkir && (
                                                                                                                    <span className={styles.diskonText}>
                                                                                                                        Setelah Diskon ({pesanan.diskon}%): {FormatRupiah(priceAfterDiscount)}
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </li>
                                                                                            )
                                                                                        })}

                                                                                        {shippingItems.map((item, k) => (
                                                                                            <li key={`ongkir-${k}`} className={styles.containeritemWrapper}>
                                                                                                <div className={styles.itemWrapper}>
                                                                                                    <div className={styles.itemImage}>
                                                                                                        {item?.image ? (
                                                                                                            <Link
                                                                                                                target="_blank"
                                                                                                                href={`${process.env.NEXT_PUBLIC_URL2}/product/${item.slugProduct}`}
                                                                                                            >
                                                                                                                <Image
                                                                                                                    src={item.image}
                                                                                                                    width={60}
                                                                                                                    height={60}
                                                                                                                    alt={item.productName || ""}
                                                                                                                    unoptimized
                                                                                                                />
                                                                                                            </Link>
                                                                                                        ) : <FaShippingFast size={30} />}
                                                                                                    </div>
                                                                                                    <div className={styles.itemDetails}>
                                                                                                        <Link
                                                                                                            target="_blank"
                                                                                                            href={`${process.env.NEXT_PUBLIC_URL2}/product/${item.slugProduct}`}
                                                                                                            className={styles.itemLink}
                                                                                                        >
                                                                                                            {item.productName}
                                                                                                            {item?.note && (
                                                                                                                <span className={styles.itemNote}> ({item.note})</span>
                                                                                                            )}
                                                                                                        </Link>

                                                                                                        <div className={styles.itemMeta}>
                                                                                                            <span>Qty: {item.quantity}x</span>
                                                                                                            <span>Harga: {FormatRupiah(item.price)}</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </li>
                                                                                        ))}
                                                                                    </div>
                                                                                </ul>
                                                                            </div>
                                                                            <div className={styles.orderDetailColumn}>
                                                                                <h4 className={styles.detailHeading}>Transaksi</h4>
                                                                                <div className={styles.transactionInfoBlock}>
                                                                                    <div className={styles.infoRow}>
                                                                                        <span className={styles.infoLabel}>ID:</span>
                                                                                        <span className={styles.infoValue}>{pesanan?.merchantOrderId}</span>
                                                                                    </div>
                                                                                    <div className={styles.infoRow}>
                                                                                        <span className={styles.infoLabel}>Status Pembayaran:</span>
                                                                                        <span className={styles.infoValue}>{pesanan?.payment ? 'Lunas' : 'Belum Bayar'}</span>
                                                                                    </div>
                                                                                    <div className={styles.infoRow}>
                                                                                        <span className={styles.infoLabel}>Dipesan:</span>
                                                                                        <span className={styles.infoValue}>{moment((pesanan?.start).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).format('DD MMM YYYY | HH:mm')}</span>
                                                                                    </div>
                                                                                    {pesanan.payment && (
                                                                                        <div className={styles.infoRow}>
                                                                                            <span className={styles.infoLabel}>Lunas:</span>
                                                                                            <span className={styles.infoValue}>{moment((pesanan?.end).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).format('DD MMM YYYY | HH:mm')}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    <div className={styles.infoRow}>
                                                                                        <span className={styles.infoLabel}>Kode VOUCHER:</span>
                                                                                        <span className={styles.infoValue}>{pesanan?.kode}</span>
                                                                                    </div>
                                                                                    <div className={styles.infoRow}>
                                                                                        <span className={styles.infoLabel}>Nama:</span>
                                                                                        <span className={styles.infoValue}>{pesanan?.nama_lengkap_user}</span>
                                                                                    </div>
                                                                                    <div className={styles.infoRow}>
                                                                                        <span className={styles.infoLabel}>Nomer Telepon:</span>
                                                                                        <span className={styles.infoValue}>{pesanan?.no_hp_user}</span>
                                                                                    </div>
                                                                                    <div className={styles.infoRow}>
                                                                                        <span className={styles.infoLabel}>Alamat:</span>
                                                                                        <span className={styles.infoValue}>{pesanan?.alamat_lengkap_user}</span>
                                                                                    </div>
                                                                                    <div className={styles.infoRow}>
                                                                                        <span className={styles.infoLabel}>Catatan:</span>
                                                                                        <span className={styles.infoValue}>{pesanan?.catatan_pengiriman || '-'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </Fragment>
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </>
                }
            </div >

        </>
    )
}
