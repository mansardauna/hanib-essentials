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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hanib Essentials",
  },
};

export const viewport = {
  themeColor: "#5da09b",
};

import { Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import InstallPrompt from '@/components/InstallPrompt';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="bg-slate-50">
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* The Sidebar component manages its own mobile drawer vs desktop permanent state */}
            <div className="hidden md:block shrink-0">
              <Sidebar />
            </div>
            
            <div className="flex-1 flex flex-col min-w-0">
              <Suspense fallback={<div className="h-20 bg-white"></div>}>
                <Navbar />
              </Suspense>
              
              {/* Added a bottom padding to account for mobile navigation bar */}
              <div className="flex-1 w-11/12 mx-auto max-w-none pb-24 md:pb-8">
                {children}
              </div>
            </div>
          </div>
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
