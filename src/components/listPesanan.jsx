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
import { DeleteDataPesanan, GetDataPesanan } from '@/service/handleGetDataPesanan';
import Image from 'next/image';
import { FaShippingFast } from "react-icons/fa";
export default function ListPesanan({ session, data, month, year, payment }) {

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

    const handleSaveTracking = async (id) => {
        setLoading(true)
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

    const handleStatusChange = async (id, newStatus) => {
        setIDitem(id)
        // setLoading(true)
        const fetchData = async () => await UpdateDataPesanan({
            id: id,
            status: newStatus,
        })
        await toast.promise(
            fetchData(),
            {
                loading: 'Loading Ganti yachh...',
                success: <b>Suksesss diganti!</b>,
                error: <b>Try again</b>,
            }
        );
        router.refresh()
        // setLoading(false)
    };

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
                        <div className="totalpesanan">{payment == null && "" || payment == 'false' && 'Belum Bayar ' || payment == 'true' && 'Sudah Bayar '}{data.totalCart} Invoice</div>
                        <div className={styles.dalamcontainer}>
                            <div className={styles.bawah}>
                                <table className={styles.orderTable}>
                                    <thead>
                                        <tr>
                                            <th>Data Transaksi</th>
                                            <th>Pesanan</th>
                                            <th>Status</th>
                                            {/* <th>Item</th> */}
                                            {/* <th>Nota</th> */}
                                            <th>Note</th>
                                            {UserSPV && <th>Delete</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <Fragment >
                                            {data?.data?.map((pesanan, j) => {
                                                console.log();
                                                return (
                                                    <tr key={j}>
                                                        {/* Data Transaksi */}
                                                        <td className={styles.transaction}>

                                                            {/* {pesanan?.payment &&
                                                                <div
                                                                    style={{ background: !pesanan.payment ? 'yellow' : 'green', color: !pesanan.payment ? 'green' : 'white' }}
                                                                    className={styles.reference}
                                                                    onClick={() => HandleNota(pesanan?.merchantOrderId)}
                                                                >
                                                                    Download Nota Official
                                                                </div>} */}
                                                            {pesanan?.payment && <br />}
                                                            {pesanan?.payment &&
                                                                <div
                                                                    style={{ background: !pesanan.payment ? 'yellow' : 'green', color: !pesanan.payment ? 'green' : 'white' }}
                                                                    className={styles.reference}
                                                                    onClick={() => router.push('https://' + pesanan?.nota_url)}
                                                                >
                                                                    Download Nota PaperID
                                                                </div>}
                                                            {pesanan?.payment && <br />}
                                                            ID: <span style={{ color: 'red' }}>{pesanan?.merchantOrderId}</span>
                                                            {pesanan?.payment &&
                                                                <>
                                                                    <div> <span className={styles.label}>channel: </span> <span> {JSON.parse(pesanan?.payment_info)?.channel.toUpperCase()} </span>  </div>
                                                                    <div> <span className={styles.label}>method: </span> <span> {JSON.parse(pesanan?.payment_info)?.method.toUpperCase()} </span> </div>
                                                                    <div> <span className={styles.label}>status: </span> <span> {JSON.parse(pesanan?.payment_info)?.status.toUpperCase()} </span> </div>
                                                                </>
                                                            }
                                                            <div className={styles.tanggal}>
                                                                <div>
                                                                    <span className={styles.label}> dipesan:</span><span> {moment((pesanan?.start).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).format('LL | LT')}</span>
                                                                </div>
                                                                <div>
                                                                    {pesanan.payment && <>
                                                                        <span className={styles.label}>lunas :</span> <span>{moment((pesanan?.end).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).format('LL | LT')}</span></>}
                                                                </div>
                                                            </div>
                                                            {pesanan?.payment && "========================"}
                                                            <div><span className={styles.label}>Nama:</span> <span className="value">{pesanan?.nama_lengkap_user}</span></div>
                                                            <div><span className={styles.label}>HP:</span> <span className="value">{pesanan?.no_hp_user}</span></div>
                                                            <div><span className={styles.label}>Alamat:</span> <span className="value">{pesanan?.alamat_lengkap_user}</span></div>
                                                            <div><span className={styles.label}>Kode Pos:</span> <span className="value">{pesanan?.kode_pos_user}</span></div>
                                                            <div><span className={styles.label}>Catatan:</span> <span className="value">{pesanan?.catatan_pengiriman}</span></div>
                                                            <div><span className={styles.label}>Kode Kupon:</span> <span className="value">{pesanan?.kode ? pesanan?.kode : 'NOVOUCHER'}</span></div>
                                                        </td>

                                                        {/* Produk dalam 1 kolom */}
                                                        <td>
                                                            <ul className={styles.listitem}>
                                                                <div className={styles.itemproduk}>
                                                                    {pesanan?.dataPesananItems?.filter(item => item.note !== 'ongkir')
                                                                        ?.map((item, k) => {

                                                                            const isOngkir = item?.note === "ongkir";
                                                                            const priceAfterDiscount = isOngkir
                                                                                ? item.price
                                                                                : item.price - (item.price * pesanan.diskon) / 100;

                                                                            return (
                                                                                <li key={k} className={styles.containeritemWrapper} >
                                                                                    <div className={styles.itemWrapper}>
                                                                                        {item?.image ? (
                                                                                            <Link
                                                                                                target="_blank"
                                                                                                href={`${process.env.NEXT_PUBLIC_URL2}/product/${item.slugProduct}`}
                                                                                                className={styles.itemLink}
                                                                                            >  <Image
                                                                                                    src={item.image}
                                                                                                    width={100}
                                                                                                    height={100}
                                                                                                    alt={item.productName || ""}
                                                                                                    unoptimized
                                                                                                />
                                                                                            </Link>
                                                                                        ) : <FaShippingFast size={100} />}
                                                                                    </div>
                                                                                    <div className={styles.itemWrapper}>
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
                                                                                </li>
                                                                            );
                                                                        })}


                                                                    {pesanan?.dataPesananItems?.filter(item => item.note === 'ongkir')
                                                                        ?.map((item, k) => {

                                                                            const isOngkir = item?.note === "ongkir";
                                                                            const priceAfterDiscount = isOngkir
                                                                                ? item.price
                                                                                : item.price - (item.price * pesanan.diskon) / 100;

                                                                            return (
                                                                                <li key={k} className={styles.containeritemWrapper} >
                                                                                    <div className={styles.itemWrapper}>
                                                                                        {item?.image ? (
                                                                                            <Link
                                                                                                target="_blank"
                                                                                                href={`${process.env.NEXT_PUBLIC_URL2}/product/${item.slugProduct}`}
                                                                                                className={styles.itemLink}
                                                                                            >  <Image
                                                                                                    src={item.image}
                                                                                                    width={100}
                                                                                                    height={100}
                                                                                                    alt={item.productName || ""}
                                                                                                    unoptimized
                                                                                                />
                                                                                            </Link>
                                                                                        ) : <FaShippingFast size={100} />}
                                                                                    </div>
                                                                                    <div className={styles.itemWrapper}>
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
                                                                                </li>
                                                                            );
                                                                        })}
                                                                </div>

                                                                <div className={styles.totalharga}>
                                                                    <div>
                                                                        Total Produk:
                                                                        <strong>
                                                                            {" "}
                                                                            {pesanan?.dataPesananItems?.reduce(
                                                                                (total, item) => total + item.quantity,
                                                                                0
                                                                            ) - 1}
                                                                        </strong>{" "}
                                                                        items
                                                                    </div>
                                                                    {Boolean(Number(pesanan?.diskon_nominal)) &&
                                                                        <div>
                                                                            sub Harga:{" "}
                                                                            <strong>

                                                                                {FormatRupiah(pesanan?.dataPesananItems?.reduce((total, item) => {
                                                                                    const priceAfterDiscount = item.note !== 'ongkir' ? item.price - (item.price * pesanan.diskon) / 100 : item.price;
                                                                                    return priceAfterDiscount + total;
                                                                                }, 0))}
                                                                            </strong>
                                                                        </div>}
                                                                    {Boolean(Number(pesanan?.diskon_nominal)) &&
                                                                        <div>
                                                                            Diskon Nominal:{""}
                                                                            <strong>
                                                                                {FormatRupiah(Number(pesanan?.diskon_nominal))}
                                                                            </strong>
                                                                        </div>
                                                                    }

                                                                    <div>
                                                                        Total Harga:{" "}
                                                                        <strong>
                                                                            {FormatRupiah(
                                                                                pesanan?.dataPesananItems?.reduce((total, item) => {
                                                                                    const price = Number(item.price); // pastikan number

                                                                                    const priceAfterDiscount =
                                                                                        item.note !== 'ongkir'
                                                                                            ? price - (price * pesanan.diskon) / 100
                                                                                            : price;

                                                                                    return total + priceAfterDiscount;
                                                                                }, 0) - Number(pesanan?.diskon_nominal)
                                                                            )}
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                            </ul>
                                                        </td>

                                                        {/* Status */}
                                                        <td>
                                                            {pesanan?.dataPesananItems?.map((item, k) => {
                                                                return (
                                                                    <div key={k} style={{ marginBottom: "8px" }}>
                                                                        {iditem === item?.id && loading ? (
                                                                            <BeatLoader size={10} />
                                                                        ) : (
                                                                            <select
                                                                                style={
                                                                                    item?.status === "Dikirim"
                                                                                        ? { background: 'yellow' }
                                                                                        : item?.status === "Selesai"
                                                                                            ? { background: 'green', color: 'white' }
                                                                                            : item?.status === "Diproses"
                                                                                                ? { background: 'grey', color: 'white' }
                                                                                                : item?.productName == "Ongkos Kirim" ? { display: 'none' } : {}
                                                                                }
                                                                                value={item?.status}
                                                                                onChange={(e) => handleStatusChange(item?.id, e.target.value)}
                                                                            >
                                                                                <option value="">Belum Diproses</option>
                                                                                <option value="Diproses">Diproses</option>
                                                                                <option value="Dikirim">Dikirim</option>
                                                                                <option value="Selesai">Selesai</option>
                                                                            </select>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </td>

                                                        {/* Note / Resi */}
                                                        <td>
                                                            {pesanan?.dataPesananItems?.map((item, k) => (
                                                                <div key={k} style={{ marginBottom: "8px" }}>
                                                                    {!openResi && item?.status === "Dikirim" && (
                                                                        <button onClick={() => handleTrackingNumberChange(item?.id)}>
                                                                            {item?.noResi ? item?.noResi : 'Tambahkan Resi'}
                                                                        </button>
                                                                    )}
                                                                    {openResi && idItemResi === item?.id && item?.status === "Dikirim" && (
                                                                        <div className={styles.noresi}>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Masukkan nomor resi"
                                                                                value={resi}
                                                                                onChange={(e) => setResi(e.target.value)}
                                                                                disabled={loading}
                                                                            />
                                                                            <button disabled={loading} onClick={() => handleSaveTracking(item?.id)}>
                                                                                {idItemResi === item?.id && loading
                                                                                    ? 'Loading'
                                                                                    : item?.noResi
                                                                                        ? 'Update'
                                                                                        : 'Simpan'}
                                                                            </button>
                                                                            <div className={styles.close} onClick={() => setOpenResi(false)}>x</div>
                                                                        </div>
                                                                    )}
                                                                    {item?.status === "Selesai" && <span>Pesanan selesai</span>}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        {UserSPV && <td><button disabled={deletePesanan} onClick={() => HandleDeleteOrder(pesanan.id)}>{deletePesanan ? 'Loading..' : 'DELETE'}</button></td>}
                                                    </tr>
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
