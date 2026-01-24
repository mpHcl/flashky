"use client";
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Settings as SettingsType} from "./lib/type";
import { fetchGetUserSettings, fetchUpdateUserSettings } from "./lib/fetch";

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>();

  useEffect(()=>{
    fetchGetUserSettings(setSettings);
  }, []);

  const saveUserSettings = ()=>{
    settings && fetchUpdateUserSettings(settings);
  }
  
  return (
    settings &&
    <Stack spacing={2} sx={{ maxWidth: 300 }}>
      <Typography variant="h4">Settings</Typography>

      <FormControl fullWidth>
        <InputLabel>Theme</InputLabel>
        <Select
          value={settings.theme}
          label="Theme"
          onChange={(e) => setSettings({theme: e.target.value})}
        >
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" onClick={saveUserSettings}>Save</Button>
    </Stack>
  );
}