import { Box, Stack } from "@mui/material";
import Sidebar from "../components/sidebar/SideBar";
import SearchBox from "../components/SearchBar";
import { userRoutes } from "../components/sidebar/SideBarRoutes";

export default function AppLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <Box sx={{ display: 'flex', margin: 2, height: '100vh' }}>
            <Sidebar routes={userRoutes} />
            <Stack spacing={5} sx={{ width: '100%'}}>
                <SearchBox />
                {children}
            </Stack>
        </Box>
    );
}
