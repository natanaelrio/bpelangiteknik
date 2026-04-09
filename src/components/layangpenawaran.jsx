'use client';

import { useState } from 'react';
import styles from '@/components/layangpenawaran.module.css';
import GetRandomPhoneNumber from '@/utils/getRandomPhoneNumber';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import QRCode from 'qrcode';
import LogoAtas from './logo/logoAtas';
import TTD from './logo/ttd';
import { FormatRupiah } from '@/utils/formatRupiah';
import { useCon } from '@/zustand/useCon';
import { sendGAEventL } from '@/lib/ga';

export default function Layangpenawaran({ dataPenawaran, setDataPenawaran }) {
    const logoBase64 = LogoAtas()
    const logoTTD = TTD()
    const phoneNumbers = GetRandomPhoneNumber();

    const bankList = [
        {
            nama: "Bank BCA - PT Pelangi Teknik Indonesia",
            detail: `Bank BCA
a.n PT Pelangi Teknik Indonesia
Cab : Lindeteves Trade Center
Swift Code : CENAIDJA
a.c 5885.127.255`
        },
        {
            nama: "Bank BCA - Fenti Marlina",
            detail: `Bank BCA
a.n Fenti Marlina
Cab : Lindeteves Trade Center
Swift Code : CENAIDJA
a.c 588.5062.609`
        }
    ];

    console.log(dataPenawaran);

    const defaultNotes = [
        "Garansi servise 1 tahun",
        "Harga Include ppn",
        "Pembayaran cash before shipping",
        "Franco Jabodetabek",
        "Surat penawaran berlaku selama 3 (Tiga) minggu sejak surat penawaran di buat."
    ];

    const setTotalPenawaran = useCon((state) => state.setTotalPenawaran)
    const setLayangPenawaran = useCon((state) => state.setLayangPenawaran)
    const [customerName, setCustomerName] = useState('');
    const [nameSales, setNameSales] = useState('');
    const [numberSales, setNumberSales] = useState('');
    const [selectedBank, setSelectedBank] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [notes, setNotes] = useState(defaultNotes);
    const [errorMsg, setErrorMsg] = useState("");

    // Hitung total harga satuan & total keseluruhan
    const totalHargaSatuan = dataPenawaran.reduce((acc, item) => acc + Number(item.productPriceFinal), 0);
    const totalKeseluruhan = dataPenawaran.reduce((acc, item) => acc + (Number(item.productPriceFinal) * Number(item.qty || 1)), 0);
    const totalQty = dataPenawaran.reduce((acc, item) => acc + (Number(item.qty || 1)), 0);

    const updateQty = (index, value) => {
        if (value < 1) return;
        const updated = [...dataPenawaran];
        updated[index] = { ...updated[index], qty: value || 1 };
        setDataPenawaran(updated);
    };

    const handleContactChange = (e) => {
        const contact = phoneNumbers.find(
            (item) => item.sales === e.target.value
        );
        if (contact) {
            setNameSales(contact.sales);
            setNumberSales(contact.numberForm);
        }
    };

    const updateNote = (index, value) => {
        const updated = [...notes];
        updated[index] = value;
        setNotes(updated);
    };

    const removeNote = (index) => {
        setNotes(notes.filter((_, i) => i !== index));
    };

    const addNote = () => {
        if (!newNote.trim()) return;
        setNotes([...notes, newNote]);
        setNewNote('');
    };

    const generateQRCode = async (text) => {
        try {
            return await QRCode.toDataURL(text);
        } catch (err) {
            console.error(err);
            return '';
        }
    };


    const handleSubmitPenawaran = async () => {

        setErrorMsg("");

        // Validasi input kosong
        if (!customerName || customerName.trim() === "") {
            setErrorMsg("Nama customer tidak boleh kosong.");
            return;
        }
        if (!nameSales) {
            setErrorMsg("Silakan pilih sales terlebih dahulu.");
            return;
        }
        if (!selectedBank) {
            setErrorMsg("Silakan pilih rekening pembayaran.");
            return;
        }
        if (dataPenawaran.length === 0) {
            setErrorMsg("List penawaran belum ada. Tambahkan minimal 1 item.");
            return;
        }
        try {
            const qrCodeData = await generateQRCode(`${process.env.NEXT_PUBLIC_URL2}`);
            process.env.NODE_ENV === 'production' && sendGAEventL("GeneratePenawaranAdmin", {
                customer_penawaran_admin: customerName,
                sales_penawaran_admin: `${nameSales} - ${numberSales}`,
                customer_plus_sales: `${customerName} - ${nameSales} - ${numberSales}`,
                total_item_penawaran_admin: dataPenawaran?.length,
                total_harga_satuan_penawaran_admin: totalHargaSatuan,
                total_harga_keseluruhan_penawaran_admin: totalKeseluruhan
            });
            const docDefinitionv = {
                content: [
                    {
                        columns: [
                            {
                                image: qrCodeData,
                                width: 70,
                                style: 'qr'
                            },
                            {
                                stack: [
                                    { image: logoBase64, width: 250, alignment: 'right', style: 'gambarlogo' },
                                    { text: 'Lindeteves Trade Center Lt. GF2 Blok B7 No. 05', style: 'atasLogo', alignment: 'right' },
                                    { text: 'Jl. Hayam Wuruk No.127 - Jakarta Barat', style: 'atasLogo', alignment: 'right' },
                                    { text: 'Tel.021-62303512; pelangiteknik@rocketmail.com', style: 'atasLogo', alignment: 'right' },
                                    { text: 'www.pelangiteknik.com', style: 'atasLogo', alignment: 'right' },
                                ],
                            },
                        ],
                        columnGap: 10,
                    },
                    { text: '\n' },
                    { text: '\n' },

                    { text: `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, style: 'defaultStyle' },
                    { text: '\n' },
                    { text: 'Kepada Yth,', style: 'Blode' },
                    { text: `${customerName}`, style: 'Blode' },
                    { text: '\n' },
                    { text: `Perihal       : Surat Penawaran`, style: 'Blode' },
                    { text: '\n' },
                    { text: `Dengan hormat, demikian disampaikan informasi dari barang yang saudara butuhkan :`, style: 'defaultStyle' },
                    { text: '\n' },


                    {
                        table: {
                            widths: ['auto', '*', 'auto', 'auto'],
                            body: [
                                [
                                    { text: "Jumlah Barang", style: "tableHeader", alignment: 'center' },
                                    { text: "Deskripsi Barang", style: "tableHeader" },
                                    { text: "Harga Satuan", style: "tableHeader" },
                                    { text: "Total", style: "tableHeader" },

                                ],
                                ...dataPenawaran.map((item) => ([
                                    {
                                        text: String(item.qty),
                                        style: "subheader",
                                        alignment: "center"
                                    },
                                    {
                                        stack: [
                                            {
                                                text: item.productName,
                                                style: "productjudul",
                                                margin: [0, 0, 0, 4],
                                                fontSize: 10
                                            },
                                            ...(item.spekNew && item.spekNew.length > 0
                                                ? item.spekNew.map((a) => ({
                                                    text: `${a.input} : ${a.isi}`,
                                                    style: "product",
                                                    margin: [0, 1, 0, 0],
                                                    fontSize: 9
                                                }))
                                                : []
                                            )
                                        ],
                                        style: "tableCell"
                                    },
                                    {
                                        text: FormatRupiah(Number(item.productPriceFinal)),
                                        style: "subheader",
                                        alignment: "right",
                                        fontSize: 10
                                    },
                                    {
                                        text: FormatRupiah(
                                            Number(item.productPriceFinal) * Number(item.qty)
                                        ),
                                        style: "subheader",
                                        alignment: "right",
                                        fontSize: 10
                                    }
                                ])),
                                [
                                    { text: totalQty, style: "tableHeader", alignment: 'center' },
                                    { text: "", style: "tableHeader" },
                                    { text: FormatRupiah(totalHargaSatuan), style: "tableHeader" },
                                    { text: FormatRupiah(totalKeseluruhan), style: "tableHeader" },

                                ],
                            ]
                        }, layout: {
                            hLineWidth: () => 0.5,
                            vLineWidth: () => 0.5,
                            hLineColor: () => 'gray',
                            vLineColor: () => 'gray',
                        },
                        margin: [30, 0, 30, 0]
                    },

                    { text: '\n' },

                    {
                        stack: [
                            { text: 'NOTE:', bold: true },
                            {
                                ul: notes.filter(n => n.trim() !== '')
                            }
                        ],
                        style: 'defaultStyle'
                    },

                    { text: '\n' },

                    selectedBank && {
                        text: [
                            { text: 'PEMBAYARAN:\n', bold: true },
                            selectedBank.detail
                        ], style: 'defaultStyle'
                    },

                    { text: '\n' },
                    { text: `Informasi lebih lanjut hubungi ${nameSales} (${numberSales})`, style: 'defaultStyle' },

                    { text: '\n' },
                    { text: '\n' },

                    { text: 'Salam,', style: 'ttd', alignment: 'right' },
                    { image: logoTTD, width: 150, alignment: 'right', style: 'gambarlogo' },
                    { text: 'Jakarta,', style: 'ttd', alignment: 'right' }
                ],
                styles: {
                    atasLogo: { fontSize: 8, marginLeft: 30, marginRight: 30 },
                    Blode: { fontSize: 10, bold: true, marginLeft: 30, marginRight: 30 },
                    ttd: { fontSize: 10, bold: true, marginLeft: 70, marginRight: 70 },
                    productjudul: { fontSize: 10, marginLeft: 70, marginRight: 30, bold: true },
                    product: { fontSize: 10, marginLeft: 70 },
                    defaultStyle: { fontSize: 10, marginLeft: 30, marginRight: 30 },
                    qr: { marginLeft: 30, marginRight: 30, marginTop: 10 },
                    gambarlogo: { marginRight: 14 },
                    tableHeader: { bold: true, fontSize: 10, color: 'black', fillColor: '#f2f2f2', margin: 5 },
                    tableCell: { margin: 5 },
                    subheader: { fontSize: 10, margin: 5, alignment: 'center' },
                    footerText: { fontSize: 8, italics: true, margin: [0, 0, 0, 10], color: 'gray' }
                },

                background: [
                    {
                        text: `${process.env.NEXT_PUBLIC_URL2}`,
                        absolutePosition: { x: 40, y: 800 },
                        style: 'footerText',
                    },
                ],
                footer: function (currentPage, pageCount) {
                    return {
                        text: `Halaman ${currentPage} dari ${pageCount}`,
                        alignment: 'right',
                        margin: [0, 0, 40, 20],
                        fontSize: 8,
                        color: 'gray'
                    };
                },
            };

            pdfMake.createPdf(docDefinitionv).download(
                `Surat_Penawaran_${customerName}.pdf`
            );
            setLayangPenawaran(false);
        } catch (err) {
            console.error(err);
        }
    };

    const updateTotal = () => {
        const data = JSON.parse(
            localStorage.getItem('DataPenawaran') || '[]'
        );
        setTotalPenawaran(data.length);
    };

    const removePenawaran = (index) => {
        const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus item ini?');
        if (!confirmDelete) return; // jika user cancel, berhenti

        const updated = dataPenawaran.filter((_, i) => i !== index);
        setDataPenawaran(updated);
        localStorage.setItem('DataPenawaran', JSON.stringify(updated));

        alert('Item berhasil dihapus!');
        updateTotal(); // update total realtime

        // jika sudah tidak ada item, tutup modal
        if (updated.length === 0) {
            setLayangPenawaran(false);
        }
    };

    const [manualName, setManualName] = useState('');
    const [manualQty, setManualQty] = useState(1);
    const [manualPrice, setManualPrice] = useState('');
    const addManualItem = () => {
        if (!manualName.trim()) {
            alert('Nama produk tidak boleh kosong');
            return;
        }
        if (!manualPrice || Number(manualPrice) <= 0) {
            alert('Harga harus diisi');
            return;
        }

        const newItem = {
            productName: manualName,
            qty: Number(manualQty) || 1,
            productPriceFinal: Number(manualPrice),
            spekNew: []
        };

        const updated = [...dataPenawaran, newItem];
        setDataPenawaran(updated);

        // reset input
        setManualName('');
        setManualQty(1);
        setManualPrice('');
    };

    return (
        <>
            <div className={styles.layarpenawarankeluar}
                onClick={() => setLayangPenawaran(false)}
            ></div>
            <div className={styles.overlay}>
                <div className={styles.layangPenawaran}>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setLayangPenawaran(false)}
                    >
                        ×
                    </button>
                    <h2>Penawaran</h2>

                    {/* =====================
                   CUSTOMER & SALES
                ===================== */}
                    <div className={styles.formGroup}>
                        <label>Nama Customer <span style={{ color: 'red' }}>*</span></label>
                        <input
                            value={customerName}
                            onChange={(e) => {
                                setCustomerName(e.target.value);
                                setErrorMsg(""); // Hapus pesan error saat mulai mengetik
                            }}
                            placeholder="Nama customer"
                            className={!customerName && errorMsg ? styles.inputError : ''}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Sales <span style={{ color: 'red' }}>*</span></label>
                        <select
                            onChange={(e) => {
                                handleContactChange(e);
                                setErrorMsg(""); // Hapus pesan error saat memilih
                            }}
                            defaultValue=""
                            className={!nameSales && errorMsg ? styles.inputError : ''}
                        >
                            <option value="" disabled>Pilih sales</option>
                            {phoneNumbers.map((item, i) => (
                                <option key={i} value={item.sales}>
                                    {item.sales}
                                </option>
                            ))}
                        </select>
                    </div>

                    {nameSales && (
                        <div className={styles.salesInfo}>
                            <small><b>{nameSales}</b></small>
                            <small>{numberSales}</small>
                        </div>
                    )}

                    {/* =====================
                   BANK LIST
                ===================== */}
                    <div className={styles.formGroup}>
                        <label>Rekening Pembayaran <span style={{ color: 'red' }}>*</span></label>
                        <select
                            onChange={(e) => {
                                setSelectedBank(bankList[e.target.value]);
                                setErrorMsg(""); // Hapus pesan error saat memilih
                            }}
                            defaultValue=""
                            className={!selectedBank && errorMsg ? styles.inputError : ''}
                        >
                            <option value="" disabled>
                                Pilih rekening
                            </option>
                            {bankList.map((bank, i) => (
                                <option key={i} value={i}>
                                    {bank.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedBank && (
                        <pre className={styles.bankDetail}>
                            {selectedBank.detail}
                        </pre>
                    )}

                    {/* =====================
                   LIST PENAWARAN
                ===================== */}
                    {dataPenawaran.map((item, index) => (
                        <div key={index} className={styles.penawaranItem}>
                            <span className={styles.nama}>{item.productName}</span>
                            <div className={styles.qtyControl}>
                                <button onClick={() => updateQty(index, item.qty - 1)}>−</button>
                                <input
                                    type="number"
                                    value={item.qty || 1}
                                    min="1"
                                    onChange={(e) =>
                                        updateQty(index, Number(e.target.value))
                                    }
                                />
                                <button onClick={() => updateQty(index, item.qty + 1)}>+</button>
                                {/* HAPUS */}
                                <button
                                    onClick={() => removePenawaran(index)}
                                    className={styles.deleteBtn}
                                    title="Hapus item"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className={styles.manualBox}>
                        <h4>Tambah Manual</h4>

                        <input
                            placeholder="Nama Produk"
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                        />

                        <div className={styles.row}>
                            <input
                                type="number"
                                placeholder="Qty"
                                min="1"
                                value={manualQty}
                                onChange={(e) => setManualQty(Number(e.target.value))}
                            />

                            <input
                                type="number"
                                placeholder="Harga"
                                value={manualPrice}
                                onChange={(e) => setManualPrice(e.target.value)}
                            />
                        </div>

                        <button onClick={addManualItem}>Tambah Produk</button>
                    </div>


                    {/* =====================
                   NOTES
                ===================== */}
                    <div className={styles.notesBox}>
                        <h4>Catatan</h4>
                        {notes.map((note, index) => (
                            <div key={index} className={styles.noteItem}>
                                <input
                                    value={note}
                                    onChange={(e) =>
                                        updateNote(index, e.target.value)
                                    }
                                />
                                <button onClick={() => removeNote(index)}>×</button>
                            </div>
                        ))}

                        {/* ADD NOTE */}
                        <div className={styles.addNote}>
                            <input
                                placeholder="Tambah catatan..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                            />
                            <button onClick={addNote}>+</button>
                        </div>

                        {/* PESAN ERROR DITAMPILKAN DI SINI */}
                        {errorMsg && (
                            <div style={{ color: "red", marginTop: "15px", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>
                                {errorMsg}
                            </div>
                        )}

                        {/* =====================
                        SUBMIT
                        ===================== */}
                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmitPenawaran}
                            style={{ marginTop: errorMsg ? "10px" : "20px" }} // Menyesuaikan jarak jika error muncul
                        >
                            Buat Penawaran
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

}
