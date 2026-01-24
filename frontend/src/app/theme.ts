'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto',
  },
  palette: {
    mode: 'dark',
    primary: {
      light: '#6fbf73',
      main: '#4caf50',
      dark: '#357a38',
      contrastText: '#fff', 
    },
    secondary: {
      light: '#f73378',
      main: '#f50057',
      dark: '#ab003c',
      contrastText: '#000',
    },
  },
});

export default theme;
