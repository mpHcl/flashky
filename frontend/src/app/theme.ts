'use client';
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
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

const lightTheme = createTheme({
  typography: {
    fontFamily: "Roboto",
  },
  palette: {
    mode: "light",
    primary: {
      light: "#81c784",   // lighter green
      main: "#4caf50",    // same brand green
      dark: "#388e3c",
      contrastText: "#000",
    },
    secondary: {
      light: "#ff5983",
      main: "#f50057",
      dark: "#ab003c",
      contrastText: "#000",
    },
  },
});

export const getTheme = (type: string) => {
  switch(type.toLowerCase()){
    case "dark":
      return darkTheme;
    case "light":
      return lightTheme;
    default:
      console.log("ERROR: Wrong theme type parameter");
      return lightTheme;
  }
}
