import styles from '@/components/penawaran.module.css'
import { useCon } from "@/zustand/useCon";
import { useLockBodyScroll } from "@uidotdev/usehooks";
import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FormatRupiah } from '@/utils/formatRupiah';
import toast from 'react-hot-toast';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import LogoAtas from './logo/logoAtas';
import TTD from './logo/ttd';
import QRCode from 'qrcode';
import GetRandomPhoneNumber from '@/utils/getRandomPhoneNumber';

export default function Penawaran({ data }) {

    useLockBodyScroll();
    const phoneNumbers = GetRandomPhoneNumber()
    const spec = data?.spec_product
    const logoBase64 = LogoAtas()
    const logoTTD = TTD()

    const [loading, setLoading] = useState(false)
    const setIsPenawaran = useCon((state) => state.setIsPenawaran)

    // <<< BANK ADDED: list bank >>>
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

    // <<< UPDATED INITIAL VALUES >>>
    const initialValues = {
        name: '',
        number: '',
        email: '',
        notes: [
            "Garansi servise 1 tahun",
            "Harga Include ppn",
            "Pembayaran cash before shipping",
            "Franco Jabodetabek",
            "Surat penawaran berlaku selama 3 (Tiga) minggu sejak surat penawaran di buat."
        ],
        jumlahBarang: '',
        nameSales: '',
        numberSales: '',

        // <<< BANK ADDED >>>
        bank: '',
        bankDetail: '',
    };

    const validationSchema = Yup.object({
        name: Yup.string()
            .max(300, 'max 300 karakter')
            .required('Name is required'),
        jumlahBarang: Yup.number()
            .max(300, 'max 300 karakter')
            .required('Jumlah Barang is required'),
        notes: Yup.array().of(
            Yup.string().max(300, "Maks 300 karakter")
        )
    });

    const generateQRCode = async (text) => {
        try {
            return await QRCode.toDataURL(text);
        } catch (err) {
            console.error(err);
            return '';
        }
    };

    const handleContactChange = (e, setFieldValue) => {
        const selectedName = e.target.value;
        const contact = phoneNumbers.find((item) => item.sales === selectedName);
        if (contact) {
            setFieldValue('nameSales', contact.sales);
            setFieldValue('numberSales', contact.numberForm);
        }
    };

    // <<< BANK ADDED: handler >>>
    const handleBankChange = (e, setFieldValue) => {
        const selected = bankList.find(item => item.nama === e.target.value);
        if (selected) {
            setFieldValue("bank", selected.nama);
            setFieldValue("bankDetail", selected.detail);
        }
    };

    const handleSubmit = async (values) => {

        try {
            setLoading(true)

            const qrCodeData = await generateQRCode(`${process.env.NEXT_PUBLIC_URL2}/product/${data.slugProduct}`);

            const allNotesText = values.notes.filter(n => n.trim() !== "").join("\n");

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
                    { text: `${values.name}`, style: 'Blode' },
                    { text: '\n' },
                    { text: `Perihal       : Surat Penawaran`, style: 'Blode' },
                    { text: '\n' },
                    { text: `Dengan hormat, demikian disampaikan informasi dari barang yang saudara butuhkan :`, style: 'defaultStyle' },
                    { text: '\n' },

                    {
                        table: {
                            widths: ["auto", "*", "auto", "auto"],
                            body: [
                                [
                                    { text: "Jumlah Barang", style: "tableHeader", alignment: 'center' },
                                    { text: "Deskripsi Barang", style: "tableHeader" },
                                    { text: "Harga Satuan", style: "tableHeader" },
                                    { text: "Total", style: "tableHeader" },

                                ],
                                [
                                    { text: `${values.jumlahBarang}`, style: "subheader" },
                                    {
                                        stack: [
                                            {
                                                text: `${data.productName}`,
                                                style: "productjudul",
                                                margin: [0, 0, 0, 4],
                                                fontSize: 10,
                                            },
                                            ...data.spekNew.map((item) => ({
                                                text: `${item.input} : ${item.isi}`,
                                                style: "product",
                                                margin: [0, 1, 0, 0],
                                                fontSize: 10
                                            }))
                                        ],
                                        style: "tableCell"
                                    },
                                    { text: `${FormatRupiah(Number(data.productPriceFinal))}`, style: "subheader", fontSize: 10 },
                                    { text: `${FormatRupiah(Number(data.productPriceFinal * Number(values.jumlahBarang)))}`, style: "subheader", fontSize: 10 },

                                ]],
                        },
                        layout: {
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
                            { text: 'NOTE:', bold: true, margin: [0, 0, 0, 5] },
                            {
                                ul: values.notes
                                    .filter(n => n.trim() !== "")   // buang note kosong
                                    .map(n => n)                    // isi UL
                            }
                        ],
                        style: 'defaultStyle'
                    },

                    { text: '\n' },

                    // <<< BANK ADDED IN PDF >>>
                    {
                        text: [
                            { text: 'PEMBAYARAN:\n', bold: true },
                            { text: values.bankDetail }
                        ],
                        style: 'defaultStyle'
                    },

                    { text: '\n' },

                    { text: `Demikian disampaikan, untuk informasi lebih lanjut hubungi ${values.nameSales} ( ${values.numberSales} ).`, style: 'defaultStyle' },
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
                        text: `${process.env.NEXT_PUBLIC_URL2}/product/${data.slugProduct}`,
                        absolutePosition: { x: 40, y: 800 },
                        style: 'footerText',
                    },
                ],
            };

            pdfMake.createPdf(docDefinitionv).download(`surat_penawaran - ${values.name} - ${data.productName}.pdf`);
            setLoading(false)
        } catch (e) {
            setLoading(false)
        }
    }

    return (
        <>
            <div className={styles.bghitam} onClick={() => setIsPenawaran()}>LoginGoogle</div>
            <div className={styles.container}>
                <div className={styles.dalamcontainer}>
                    <div className={styles.text}>
                        Surat Penawaran <b>{data?.productName}</b>
                    </div>

                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ values, setFieldValue }) => (
                            <Form>

                                {/* JUMLAH BARANG */}
                                <div className={styles.jumlahbarang}>
                                    <b>Jumlah Barang</b>
                                    <div className={styles.input}>
                                        <ErrorMessage name="jumlahBarang" className={styles.er} component="div" />
                                        <Field type="text" name="jumlahBarang" placeholder="ex 10" disabled={loading} />
                                    </div>
                                </div>

                                {/* CUSTOMER */}
                                <div className={styles.custumer}>
                                    <b>Informasi Customer</b>
                                    <div className={styles.input}>
                                        <ErrorMessage name="name" className={styles.er} component="div" />
                                        <Field type="text" name="name" placeholder="Nama Lengap" disabled={loading} />
                                    </div>
                                </div>

                                {/* SALES */}
                                <div className={styles.salles}>
                                    <b>Informasi Sales</b>

                                    <div className={styles.input}>
                                        <Field
                                            as="select"
                                            name="contact"
                                            onChange={(e) => handleContactChange(e, setFieldValue)}
                                            disabled={loading}
                                        >
                                            <option value="">Pilih Kontak Sales</option>
                                            {phoneNumbers.map((contact, index) => (
                                                <option key={index} value={contact.sales}>
                                                    {contact.sales} ( {contact.numberForm} )
                                                </option>
                                            ))}
                                        </Field>
                                    </div>

                                    {/* ===================== BANK SELECT ====================== */}
                                    <b>Pembayaran</b>

                                    <div className={styles.input}>
                                        <Field
                                            as="select"
                                            name="bank"
                                            onChange={(e) => handleBankChange(e, setFieldValue)}
                                            disabled={loading}
                                        >
                                            <option value="">Pilih Metode Pembayaran</option>
                                            {bankList.map((item, index) => (
                                                <option key={index} value={item.nama}>
                                                    {item.nama}
                                                </option>
                                            ))}
                                        </Field>
                                    </div>

                                    {/* TAMPILKAN DETAIL BANK */}
                                    {values.bankDetail && (
                                        <div className={styles.bankdetailbox}>
                                            <pre>{values.bankDetail}</pre>
                                        </div>
                                    )}
                                    {/* ========================================================= */}

                                    {/* ===================== NOTE DINAMIS ===================== */}
                                    <b>Note Tambahan</b>
                                    <FieldArray name="notes">
                                        {({ push, remove }) => (
                                            <div className={styles.notecontainer}>
                                                {values.notes.map((note, index) => (
                                                    <div key={index} className={styles.inputnote}>
                                                        <Field
                                                            type="text"
                                                            name={`notes[${index}]`}
                                                            placeholder="Note"
                                                            disabled={loading}
                                                        />
                                                        {
                                                            <div className={styles.deletenote} onClick={() => remove(index)}>
                                                                -
                                                            </div>
                                                        }
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => push("")}
                                                    className={styles.addBtn}
                                                >
                                                    + Tambah Note
                                                </button>
                                            </div>
                                        )}
                                    </FieldArray>
                                    {/* ========================================================== */}

                                </div>

                                <button type="submit" disabled={loading}>
                                    {loading ? 'Loading...' : 'Download Surat'}
                                </button>
                            </Form>
                        )}
                    </Formik>

                </div>
            </div>
        </>
    )
}
