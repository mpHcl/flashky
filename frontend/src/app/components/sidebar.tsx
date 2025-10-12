import { Drawer, List, ListItem, ListItemText} from '@mui/material';
import Typography from '@mui/material/Typography';

const drawerWidth = 200;

interface Route {
  name: string;
  route: string;
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
        }}
      >
        <List>
          {routes.map((el) => (
            <ListItem button='true' key={el.name} component="a" href={el.route}>
              <ListItemText disableTypography><Typography color={"primary.contrastText"}>{el.name}</Typography></ListItemText>
            </ListItem>
          ))}
        </List>
      </Drawer>
  );
}