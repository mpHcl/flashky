"use client";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Typography from '@mui/material/Typography';
import SidebarItemSubmenu from './SideBarItemSubmenu';
import { useEffect, useState } from 'react';
import { useAuth } from '../../(auth)/context/AuthContext';
import { Route } from '../lib/type';

const drawerWidth = 200;

export type SidebarProps = {
  routes: Route[];
}

export default function Sidebar({routes}: SidebarProps) {
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
        {routes.map((el : Route) => {
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