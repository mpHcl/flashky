import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ThemeProvider } from '@mui/material/styles';
import theme from "./theme";
import Sidebar from "./components/sidebar"
import SearchBox from "./components/searchbox";

export const metadata: Metadata = {
  title: "Flashky",
  description: "Learn with Flashky",
};

const routes = [
  {name: "Home", route: "/"},
  {name: "Profile", route: "/profile"},
  {name: "My Decks", route: "/mydecks"},
  {name: "My Flashky", route: "/myflashky"},
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', margin: 2 }}>
              <Sidebar routes={routes}/>
              <Stack spacing={5} sx={{ width: '100%' }}>
                <SearchBox />
                {children}
              </Stack>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
