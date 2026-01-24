import { Box, Stack } from "@mui/material";
import Sidebar from "../components/sidebar/SideBar";
import { userRoutes } from "../components/sidebar/SideBarRoutes";

export default function HomeLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <Box sx={{ display: 'flex', margin: 2 }}>
            <Sidebar routes={userRoutes} />
            <Stack spacing={5} sx={{ width: '100%' }}>
                {children}
            </Stack>
        </Box>
    );
}
