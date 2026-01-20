import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ThemeProvider } from '@mui/material/styles';
import theme from "./theme";
import Sidebar from "./components/Sidebar"
import SearchBox from "./components/searchbox";
import { AuthProvider } from "./(auth)/context/AuthContext";

import { Roboto } from 'next/font/google'

export const metadata: Metadata = {
  title: "Flashky",
  description: "Learn with Flashky",
};

const routes = [
  { name: "Home", route: "/" },
  { name: "My Decks", route: "/decks/my" },
  { name: "My Flashky", route: "/flashky/my" },
  {
    name: "Account", route: "/profile", subroutes: [
      { name: "Profile", route: "/profile" },
      { name: "Settings", route: "/profile/settings" },
      { name: "Logout", route: "/logout" },
    ]
  },
];

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
              <Box sx={{ display: 'flex', margin: 2 }}>
                <Sidebar routes={routes} />
                <Stack spacing={5} sx={{ width: '100%' }}>
                  <SearchBox />
                  {children}
                </Stack>
              </Box>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
