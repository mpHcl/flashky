import { Drawer, List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import Typography from '@mui/material/Typography';
import SidebarItemSubmenu from './SidebarItemSubmenu';

const drawerWidth = 200;

interface Route {
  name: string;
  route: string;
  subroutes?: Route[];
}

interface Routes {
  routes: Route[];
}

export default function Sidebar({routes}: Routes) {
  return (
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
            return el.subroutes ? <SidebarItemSubmenu routeParam={el} key={el.name} /> : 
            (
              <ListItem key={el.name} disablePadding>
                <ListItemButton
                component="a"
                href={el.route}>
                <ListItemText disableTypography>
                  <Typography color="primary.contrastText">
                    {el.name}
                  </Typography>
                </ListItemText>
              </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
  );
}