// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import SupabaseProvider from '@/components/SupabaseProvider';
import { CartProvider } from '@/store/CartContext';
import Script from 'next/script';
import NextTopLoader from 'nextjs-toploader'; // --- 1. ADD THIS IMPORT ---
import CacheProvider from '@/components/CacheProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Zee Crown',
  description: 'Discover Your Best Products Here',
  icons: {
    icon: '/icon-app.png',
    apple: '/apple-icon-app.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zee Crown',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        {/* --- 2. ADD THIS COMPONENT --- */}
        <NextTopLoader
          color="#2563EB" // Change this to your brand's primary color
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} // Cleaner look without the spinner
          easing="ease"
          speed={200}
        />
        {/* ----------------------------- */}

        <CacheProvider />
        <SupabaseProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </SupabaseProvider>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 1000,
            success: {
              duration: 1000,
            },
            error: {
              duration: 1000,
            },
          }}
        />

        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}