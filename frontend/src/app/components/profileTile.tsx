"use client";
import { useState, useRef, ChangeEvent } from "react";
import React, { ChangeEventHandler } from "react";
import { Box, Avatar, Stack, Paper, TextField, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";  
import { BASE_URL } from "../constants";

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
  onAvatarChange?: (file: File) => void;
}

export default function ProfileTile({ 
  profileData, 
  handleChange=() => { }, 
  editable=false, 
  onAvatarChange=() => { } }: ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAvatarChange(e.target.files[0]);
    }
  };

  const avatarSrc = profileData.avatar? `${BASE_URL}files/${profileData.avatar}`: "";
  return (
    <Box>
      <Paper elevation={3} sx={{ maxWidth: 800, minWidth: 500, margin: "auto", padding: 3, borderRadius: 2 }}>
        <Stack direction="column" alignItems="center" spacing={3}>
          {/* Avatar Section */}
          <Box position="relative"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            sx={{ cursor: editable ? "pointer" : "default" }}>
            <Avatar src={avatarSrc} alt={profileData.username} sx={{ width: 120, height: 120 }} />

            {editable && hover && (
              <Box position="absolute"
                top={0} left={0}
                width="100%" height="100%"
                display="flex" bgcolor="rgba(0,0,0,0.5)"
                alignItems="center" justifyContent="center"
                borderRadius="50%"
                onClick={() => editable && fileInputRef.current && fileInputRef.current.click()}
              >
                <IconButton sx={{ color: "white", pointerEvents: "none" }}>
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Box>
          {/* Avatar Section */}

          {/* Hidden Avatar File Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {/* Hidden Avatar File Input */}

          {!profileData.active && (
            <Typography color="error" fontWeight={600}>
              Account Inactive
            </Typography>
          )}

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={profileData.description || ""}
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
            value={profileData.creation_date.split('T')[0] + ', ' + profileData.creation_date.split('T')[1].split('.')[0]}
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