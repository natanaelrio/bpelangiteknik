'use client'
import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const LottieAnimation = ({ animationPath }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const anim = lottie.loadAnimation({
            container: containerRef.current, // Container tempat animasi akan ditampilkan
            renderer: 'svg', // Menggunakan renderer SVG
            loop: true, // Apakah animasi harus berulang
            autoplay: true, // Apakah animasi dimulai otomatis
            path: animationPath, // Path ke file Lottie JSON
        });

        return () => {
            anim.destroy(); // Menghancurkan animasi saat komponen unmount
        };
    }, [animationPath]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default LottieAnimation;
