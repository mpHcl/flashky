import { Box, Stack } from "@mui/material";
import Sidebar from "../components/sidebar";
import SearchBox from "../components/SearchBar";

export default function AppLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <Box sx={{ display: 'flex', margin: 2 }}>
            <Sidebar />
            <Stack spacing={5} sx={{ width: '100%' }}>
                <SearchBox />
                {children}
            </Stack>
        </Box>
    );
}
