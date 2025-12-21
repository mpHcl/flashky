"use client";
import { Box, List, ListItemButton, ListItemText, Popper, Paper, Typography, ListItem } from '@mui/material';
import * as React from 'react';

interface Route {
  name: string;
  route: string;
  subroutes?: Route[];
}

interface Props {
  routeParam: Route;
}

export default function SidebarItemSubmenu({ routeParam }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  if (!routeParam || routeParam.subroutes?.length === 0) {
    return null;
  }

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  var sxMt = routeParam.name === "Account" ? 'auto' : '0';
  return (
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} sx={{ mt: sxMt }}>
      <ListItem disablePadding >
        <ListItemButton
          component="a"
          href={routeParam.route}>
          <ListItemText disableTypography>
            <Typography color="primary.contrastText">
              {routeParam.name}
            </Typography>
          </ListItemText>
        </ListItemButton>
        <Popper open={open} anchorEl={anchorEl} placement="right-start">
          <Paper sx={{ minWidth: 180 }}>
            <List>
              {routeParam.subroutes?.map((route: Route) => (
                <ListItemButton
                  key={route.name}
                  component="a"
                  href={route.route}>
                  <ListItemText primary={route.name} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Popper>
      </ListItem>
    </Box>
  );
}