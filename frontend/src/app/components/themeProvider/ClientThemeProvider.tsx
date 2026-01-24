"use client";

import { ThemeProvider } from "@mui/material/styles";
import { fetchGetUserTheme } from "./lib/fetch";
import { ReactNode, useEffect, useState } from "react";
import { getTheme } from "../../theme";

export default function ClientThemeProvider({children}: {children: ReactNode;}) {
  const [theme, setTheme] = useState<string>();

  useEffect(()=>{
    fetchGetUserTheme(setTheme);
  }, [])

  return (
    theme &&
    <ThemeProvider theme={getTheme(theme)}>
      {children}
    </ThemeProvider>
  );
}