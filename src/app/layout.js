import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Hanib Essentials",
  description: "Hanib Essentials - Stationery, back-to-school items, and Household essentials.",
  manifest: "/manifest.json",
  themeColor: "#5da09b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hanib Essentials",
  },
};

import { Suspense } from 'react';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body>
        <AuthProvider>
          <Suspense fallback={<div>Loading nav...</div>}>
            <Navbar />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
