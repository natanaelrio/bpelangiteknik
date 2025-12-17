import React from 'react';
import moment from 'moment-timezone';
import 'moment/locale/id'; // Import locale bahasa Indonesia


export const TimeConverter = (isoInput) => {
    // Mengonversi input waktu ke objek moment
    const momentTime = moment(isoInput);

    // Mengonversi waktu ke zona waktu Jakarta
    const jakartaTime = momentTime.tz("Asia/Jakarta");

    // Mengambil hari, tanggal, jam, dan menit
    const day = jakartaTime.format('dddd'); // Nama hari
    const date = jakartaTime.format('DD MMMM YYYY'); // Tanggal
    const time = jakartaTime.format('HH:mm'); // Jam dan menit

    return (
        <>
            <div>
                <span>{day}, </span>
                <span>{time}</span>
            </div>
            <div>
                <span>{date} </span>
            </div>
        </>
    );
};
