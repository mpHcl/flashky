import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import NoteIcon from '@mui/icons-material/Note';
import PortraitIcon from '@mui/icons-material/Portrait';
import SettingsIcon from '@mui/icons-material/Settings';
import StyleIcon from '@mui/icons-material/Style';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import PeopleIcon from '@mui/icons-material/People';
import { Route } from '../lib/type';

export const userRoutes: Route[] = [
    { name: "Home", route: "/", submenu: false, icon: <HomeIcon /> },
    {
        name: "Decks", route: "/decks/my", submenu: false, icon: <StyleIcon />, subroutes: [
            { name: "Explore", icon: <ExploreIcon />, route: "/search" },
            { name: "My Decks", icon: <PortraitIcon />, route: "/decks/my" },
            { name: "Add Decks", icon: <AddBoxIcon />, route: "/decks/add" },
        ]
    },
    {
        name: "Flashky", route: "/flashky/my", submenu: false, icon: <NoteIcon />, subroutes: [
            { name: "My Flashky", icon: <PortraitIcon />, route: "/flashky/my" },
            { name: "Add Flashky", icon: <AddBoxIcon />, route: "/flashky/add" },
        ]
    },
    {
        name: "Account", route: "/profile", submenu: true, icon: <AccountCircleIcon />, subroutes: [
            { name: "Profile", icon: <AccountCircleIcon />, route: "/profile" },
            { name: "Logout", icon: <LogoutIcon />, route: "/logout" },
        ]
    },
];

export const moderatorRoutes: Route[] = [
    { name: "Reports", route: "/reports", submenu: false, icon: <FlagCircleIcon /> },
    { name: "Users", route: "/users", submenu: false, icon: <PeopleIcon /> },
    {
        name: "Account", route: "/profile", submenu: true, icon: <AccountCircleIcon />, subroutes: [
            { name: "Profile", icon: <AccountCircleIcon />, route: "/profile" },
            { name: "Logout", icon: <LogoutIcon />, route: "/logout" },
        ]
    },
]