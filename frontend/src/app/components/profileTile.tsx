import React, { ChangeEventHandler } from "react";
import { Box, Avatar, Stack, Paper, TextField } from "@mui/material";

interface ProfileData {
  username: string;
  email: string;
  avatar?: string;
  description?: string;
  creation_date: string;
  verified: boolean;
  active: boolean;
}

interface ProfileProps {
  profileData: ProfileData;
  handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  editable: boolean;
}

export default function ProfileTile({ profileData, handleChange, editable }: ProfileProps) {

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          maxWidth: 800,
          minWidth: 500,
          margin: "auto",
          padding: 3,
          borderRadius: 2,
        }}
      >
        <Stack direction="column" alignItems="center" spacing={3}>
          <Avatar
            src={profileData.avatar || ""}
            alt={profileData.username}
            sx={{ width: 120, height: 120 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={profileData.description}
            onChange={handleChange}
            slotProps={{
              input: {
                readOnly: !editable
              }
            }}
          />

          <TextField
            fullWidth
            label="Username"
            name="username"
            value={profileData.username}
            onChange={handleChange}
            slotProps={{
              input: {
                readOnly: !editable
              }
            }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            slotProps={{
              input: {
                readOnly: !editable
              }
            }}
          />

          <TextField
            fullWidth
            label="Joined"
            name="creation_date"
            value={profileData.creation_date}
            onChange={handleChange}
            slotProps={{
              input: {
                readOnly: true
              }
            }}
          />

        </Stack>
      </Paper>
    </Box>
  );
};