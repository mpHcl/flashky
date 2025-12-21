"use client";
import React, { useState } from "react";
import { Box, Typography, Avatar, Stack, Paper, Grid, Button } from "@mui/material";
import ProfileTile from "../components/profileTile";
import ProfileAction from "../components/profileAction";

export default function Profile() {
  const profile = {
    username: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Full-stack developer and tech enthusiast.",
    creation_date: "12-05-2020",
    verified: true,
    active: true,
  };

  const [currentAction, setCurrentAction] = useState<"none" | "change_password" | "edit" | "delete">("none");

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 10 }}>
        <Stack spacing={5} justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
          <ProfileTile profileData={profile} />

          <Box width="100%" justifyContent="center" alignItems="center">
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCurrentAction("delete")}
              >
                Delete Account
              </Button>
              <Button
                variant="contained"
                onClick={() => setCurrentAction("edit")}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                onClick={() => setCurrentAction("change_password")}
              >
                Change Password
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <ProfileAction action={currentAction} />
      </Grid>
    </Grid>
  );
};