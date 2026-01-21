import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ThemeProvider } from '@mui/material/styles';
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import NoteIcon from '@mui/icons-material/Note';
import PortraitIcon from '@mui/icons-material/Portrait';
import SearchBox from "./components/searchbox";
import SettingsIcon from '@mui/icons-material/Settings';
import StyleIcon from '@mui/icons-material/Style';
import { AuthProvider } from "./(auth)/context/AuthContext";

import { Roboto } from 'next/font/google'

export const metadata: Metadata = {
  title: "Flashky",
  description: "Learn with Flashky",
};

const routes = [
  { name: "Home", route: "/", submenu: false, icon: <HomeIcon/> },
  { name: "Decks", route: "/decks/my", submenu: false, icon: <StyleIcon/>, subroutes: [
    {name: "Explore", icon: <ExploreIcon/>, route: "/search"},
    {name: "My Decks", icon: <PortraitIcon/>, route: "/decks/my"},
    {name: "Add Decks", icon: <AddBoxIcon/>, route: "/decks/add"},
  ] },
  { name: "Flashky", route: "/flashky/my", submenu: false, icon: <NoteIcon/>, subroutes: [
    {name: "My Flashky", icon: <PortraitIcon/>, route: "/flashky/my"},
    {name: "Add Flashky", icon: <AddBoxIcon/>, route: "/flashky/add"},
  ] },
  {
    name: "Account", route: "/profile", submenu: true, icon: <AccountCircleIcon/>, subroutes: [
      { name: "Profile", icon: <AccountCircleIcon/>, route: "/profile" },
      { name: "Settings", icon: <SettingsIcon/>, route: "/profile/settings" },
      { name: "Logout", icon: <LogoutIcon/>, route: "/logout" },
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
