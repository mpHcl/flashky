"use client";
import React, { useState } from "react";
import { Box, Typography, Avatar, Stack, Paper, Grid, Button } from "@mui/material";

interface ProfileData {
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  creation_date: string;
  verified: boolean;
  active: boolean;
}

interface ProfileProps {
  profileData: ProfileData;
}

export default function ProfileTile({ profileData }: ProfileProps) {

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          maxWidth: 800,
          margin: "auto",
          padding: 3,
          borderRadius: 2,
        }}
      >
        <Stack direction="column" alignItems="left" spacing={1}>
          <Box alignSelf={"center"}>
            <Avatar
              src={profileData.avatar || ""}
              alt={profileData.username}
              sx={{ width: 120, height: 120 }}
            />
          </Box>
          {profileData.bio && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Bio
              </Typography>
              <Typography
                variant="body2"
                sx={{ textAlign: "center" }}
              >
                {profileData.bio}
              </Typography>
            </Box>
          )}
          <Typography variant="subtitle2" color="textSecondary">
            Username
          </Typography>
          <Typography variant="body1">{profileData.username}</Typography>

          <Typography variant="subtitle2" color="textSecondary">
            Email
          </Typography>
          <Typography variant="body1">{profileData.email}</Typography>

          <Typography variant="subtitle2" color="textSecondary">
            Joined
          </Typography>
          <Typography variant="body1">{profileData.creation_date}</Typography>
        </Stack>
      </Paper>
    </Box>
  );
};