"use client";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Typography from '@mui/material/Typography';
import SidebarItemSubmenu from './sidebarItemSubmenu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import NoteIcon from '@mui/icons-material/Note';
import PortraitIcon from '@mui/icons-material/Portrait';
import SettingsIcon from '@mui/icons-material/Settings';
import StyleIcon from '@mui/icons-material/Style';
import { useEffect, useState } from 'react';
import { useAuth } from '../(auth)/context/AuthContext';

const drawerWidth = 200;

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

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(isAuthenticated !== false);
  }, [isAuthenticated])

  return (isVisible &&
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          paddingTop: 2,
        },
        height: '100vh',
      }}
    >
      <List sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {routes.map((el) => {
          return el.submenu ? <SidebarItemSubmenu routeParam={el} key={el.name} /> :
            (<div key={el.name}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href={el.route}>
                  {el.icon && <ListItemIcon>{el.icon!}</ListItemIcon>}
                  <ListItemText disableTypography>
                    <Typography color="primary.contrastText">
                      {el.name}
                    </Typography>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
              {el.subroutes &&
                <List component="div" disablePadding>
                  {el.subroutes!.map((subroute: Route) => (
                    <ListItemButton
                      key={subroute.name}
                      component="a"
                      href={subroute.route}
                      sx={{ pl: 4 }}>
                      {subroute.icon && <ListItemIcon>{subroute.icon!}</ListItemIcon>}
                      <ListItemText disableTypography>
                        <Typography color="primary.contrastText">
                          {subroute.name}
                        </Typography>
                      </ListItemText>
                    </ListItemButton>
                  ))}
                </List>}</div>
            );
        })}
      </List>
    </Drawer>
  );
}