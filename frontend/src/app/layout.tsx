import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from "./theme";
import { AuthProvider } from "./(auth)/context/AuthContext";

import { Roboto } from 'next/font/google'

export const metadata: Metadata = {
  title: "Flashky",
  description: "Learn with Flashky",
};


const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700']
})

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <AuthProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
