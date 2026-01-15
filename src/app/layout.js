import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Halaman Admin BPE Langit Teknik",
  description: "Halaman Admin BPE Langit Teknik",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="G-7TXR2L5D2J" />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GoogleAnalytics gaId="G-7TXR2L5D2J" />
        <Toaster
          toastOptions={{
            style: {
              fontSize: '0.6rem'
            },
          }}
        />
        <NextTopLoader />
        {children}
      </body>
    </html>
  );
}
