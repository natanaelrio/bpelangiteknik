'use client'
import styles from '@/components/formPenawaran.module.css'
import { UpdateCatatanAdmin } from '@/service/handleUpdateCatatanAdmin';
import moment from 'moment';
import 'moment/locale/id'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import LogoAtas from './logo/logoAtas';
import TTD from './logo/ttd';
import { handleDetailProduct } from '@/service/handleDetailProduct';
import { FormatRupiah } from '@/utils/formatRupiah';
import QRCode from 'qrcode';
import GetRandomPhoneNumber from '@/utils/getRandomPhoneNumber';

export default function FormPenawaran({ data }) {

    const phoneNumbers = GetRandomPhoneNumber()
    const router = useRouter()
    const [inputValue, setInputValue] = useState('');
    const [id, setID] = useState('');
    const [black, setBlack] = useState(false);
    const [Loading, setLoading] = useState(false);
    const logoBase64 = LogoAtas()// Pendek karena hanya contoh.
    const logoTTD = TTD()// Pendek karena hanya contoh.
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true)
            await UpdateCatatanAdmin({
                id: id,
                note: inputValue
            })
            toast.success('Successfully!')
            router.refresh()
            setLoading(false)
            setBlack(false)
        }
        catch (e) {
            toast.error(`Error Internet`);
            setLoading(false)
            setBlack(false)
        }

        // Tambahkan logika pengiriman data di sini
    };

    const handleCatatan = (e) => {
        setBlack(!black)
        setInputValue(e.note)
        setID(e.id)
    }

    const generateQRCode = async (text) => {
        try {
            return await QRCode.toDataURL(text); // Menghasilkan QR Code dalam format base64
        } catch (err) {
            console.error(err);
            return '';
        }
    };

    const generatePDF = async (e, sales, note) => {
        const fetchData = async () => {
            setLoading(true)
            const data = await handleDetailProduct(e?.slugProduct)
            const contact = phoneNumbers.find((item) => item.sales === sales);

            const dataKu = data.data[0]
            const qrCodeData = await generateQRCode(`${process.env.NEXT_PUBLIC_URL2}/product/${e?.slugProduct}`);

            const docDefinitionv = {
                content: [
                    {
                        columns: [
                            {
                                image: qrCodeData, // Tambahkan QR Code base64 sebagai gambar
                                width: 70, // Ukuran gambar
                                style: 'qr'
                            },
                            {
                                stack: [
                                    {
                                        image: logoBase64, // Menyisipkan gambar logo
                                        width: 250, // Ukuran logo
                                        alignment: 'right', // Posisi logo
                                        style: 'gambarlogo'
                                    },
                                    { text: 'Lindeteves Trade Center Lt. GF2 Blok B7 No. 05', style: 'atasLogo', alignment: 'right' },
                                    { text: 'Jl. Hayam Wuruk No.127 - Jakarta Barat', style: 'atasLogo', alignment: 'right' },
                                    { text: 'Tel.021-62303512; pelangiteknik@rocketmail.com', style: 'atasLogo', alignment: 'right' },
                                    { text: 'www.pelangiteknik.com', style: 'atasLogo', alignment: 'right' },
                                ],
                            },
                        ],
                        columnGap: 10, // Jarak antar kolom
                    },
                    { text: '\n' },
                    { text: '\n' },
                    { text: '\n' },
                    { text: `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, style: 'defaultStyle' },
                    { text: '\n' },
                    { text: 'Kepada Yth,', style: 'Blode' },
                    { text: `${e?.name}`, style: 'Blode' },
                    { text: '\n' },
                    { text: `Perihal       : Surat Penawaran`, style: 'Blode' },
                    { text: '\n' },
                    { text: `Dengan hormat, demikian disampaikan informasi dari barang yang saudara butuhkan :`, style: 'defaultStyle' },

                    { text: '\n' },
                    { text: `${dataKu.productName} - ${FormatRupiah(Number(dataKu.productPriceFinal))} (include ppn )`, style: 'productjudul' },
                    dataKu.spekNew.map((data) => {
                        return (
                            { text: `${data.input} : ${data.isi}`, style: 'product' }
                        )
                    }),
                    { text: '\n' },
                    { text: '\n' },
                    {
                        text: [
                            { text: 'NOTE: ', bold: true },
                            { text: note } // Teks dari note tanpa bold
                        ],
                        style: 'defaultStyle'
                    },
                    { text: '\n' },
                    { text: '\n' },
                    { text: `Demikian disampaikan,untuk informasi lebih lanjut hubungi ${contact.sales} ( ${contact.numberForm} ).  Atas perhatiannya kami ucapkan terima kasih.`, style: 'defaultStyle' },
                    { text: '\n' },
                    { text: '\n' },
                    { text: 'Salam,', style: 'ttd', alignment: 'right' },
                    {
                        image: logoTTD, // Menyisipkan gambar logo
                        width: 150, // Ukuran logo
                        alignment: 'right', // Posisi logo
                        style: 'gambarlogo'
                    },
                    { text: 'Jakarta,', style: 'ttd', alignment: 'right' },
                ],
                styles: {
                    atasLogo: {
                        fontSize: 9,
                        marginLeft: 30,
                        marginRight: 30,
                    },
                    Blode: {
                        fontSize: 11,
                        bold: true,
                        marginLeft: 30,
                        marginRight: 30,
                    },
                    ttd: {
                        fontSize: 11,
                        bold: true,
                        marginLeft: 70,
                        marginRight: 70,
                    },
                    productjudul: {
                        fontSize: 11,
                        marginLeft: 70,
                        marginRight: 30,
                        bold: true,
                    },
                    product: {
                        fontSize: 11,
                        marginLeft: 70,
                        // bold: true,
                    },
                    defaultStyle: {
                        fontSize: 11,
                        marginLeft: 30,
                        marginRight: 30,
                    },
                    qr: {
                        fontSize: 11,
                        marginLeft: 30,
                        marginRight: 30,
                        marginTop: 10
                    },
                    gambarlogo: {
                        marginRight: 14,
                    },
                    footerText: {
                        fontSize: 10,
                        alignment: 'left',
                        color: 'gray',
                    }
                },
                background: [
                    {
                        text: `${process.env.NEXT_PUBLIC_URL2}/product/${e?.slugProduct}`,
                        absolutePosition: { x: 40, y: 800 }, // Atur posisi absolut
                        style: 'footerText',
                    },
                ],
            }
            setLoading(false)
            pdfMake.createPdf(docDefinitionv).download(`surat_penawaran - ${e?.name} - ${dataKu.productName}.pdf`);
        }

        toast.promise(
            fetchData(),
            {
                loading: 'Wait!',
                success: <b>Berhasil diDownload!</b>,
                error: <b>Try again</b>,
            }
        );
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.dalamcontainer}>
                    <div className={styles.bawah}>-
                        <table className={styles.orderTable}>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal</th>
                                    <th>Product</th>
                                    <th>Konsumen</th>
                                    <th>Email</th>
                                    <th>Nomer</th>
                                    <th>Sales</th>
                                    {/* <th>Note</th>
                                    <th>Download</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((data, i) => {
                                    return (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>
                                                {moment((data?.start).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).format('ll')}&nbsp;| &nbsp;
                                                {moment((data?.start).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).format('LT')}
                                            </td>
                                            <td><Link href={`${process.env.NEXT_PUBLIC_URL2}/product/${data?.slugProduct}`} target='_blank'>{data?.nameProduct}</Link></td>
                                            <td>{data?.name}</td>
                                            <td>{data?.email}</td>
                                            <td>{data?.noHP}</td>
                                            <td>
                                                <div className={styles.note}>
                                                    <b>{data?.sales} </b>
                                                </div>
                                                {/* <span onClick={() => handleCatatan(data)}>(edit)</span> */}
                                            </td>
                                            {/* <td onClick={() => handleCatatan(data)}>
                                                <div className={styles.note}>
                                                    {data?.note}
                                                </div>
                                                <span onClick={() => handleCatatan(data)}>(edit)</span>
                                            </td>
                                            <td><button disabled={Loading} onClick={() => generatePDF(data, data?.sales, data?.note)}>Download</button></td> */}
                                        </tr>
                                    )
                                })}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
            {black &&
                <>
                    <div className={styles.bghitam} onClick={() => setBlack(!black)} ></div>
                    <div className={styles.edit}>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="singleInput">Buat Catatan:</label>
                            <textarea
                                type="text"
                                id="singleInput"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Ketik sesuatu..."
                            />
                            <button type="submit">{Loading ? 'Loading' : 'Submit'}</button>
                        </form>
                    </div>
                </>
            }
        </>
    )
}