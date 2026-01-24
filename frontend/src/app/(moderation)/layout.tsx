import { Box, Stack } from "@mui/material";
import Sidebar from "../components/sidebar/SideBar";
import { moderatorRoutes } from "../components/sidebar/SideBarRoutes";

export default function AppLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <Box sx={{ display: 'flex', margin: 2 }}>
            <Sidebar routes={moderatorRoutes} />
            <Stack spacing={5} sx={{ width: '100%' }}>
                <Box height={10}/>
                {children}
            </Stack>
        </Box>
    );
}
