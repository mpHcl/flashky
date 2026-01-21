import { Box, Stack } from "@mui/material";
import Sidebar from "../components/sidebar";

export default function HomeLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <Box sx={{ display: 'flex', margin: 2 }}>
            <Sidebar />
            <Stack spacing={5} sx={{ width: '100%' }}>
                {children}
            </Stack>
        </Box>
    );
}
