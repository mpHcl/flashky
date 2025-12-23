"use client";
import React, { useState } from "react";
import { Box, Typography, Avatar, Stack, Paper, Grid, Button } from "@mui/material";
import ProfileTile from "../components/profileTile";
import ConfirmDialog from "../components/confirmDialog";
import ChangePasswordDialog from "./changePasswordDialog";

export default function Profile() {
  // Mock profile data
  const [profile, setProfile] = useState({
    username: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Full-stack developer and tech enthusiast.",
    creation_date: "12-05-2020",
    verified: true,
    active: true,
  });

  const [editable, setEditable] = useState(false);
  const [wasChange, setWasChange] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (value !== profile[name as keyof typeof profile])
      setWasChange(true);
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    if (editable && wasChange) {
      setSaveConfirmOpen(true);
    }
    setEditable(!editable);
  };

  const saveChanges = () => {
    // Implement save logic here

    setSaveConfirmOpen(false);
  };

  const deleteProfile = () => {
    // Implement delete logic here

    setDeleteConfirmOpen(false);
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    // Implement change password logic here

    setChangePasswordOpen(false);
  };

  return (
    <>
      <ConfirmDialog open={saveConfirmOpen}   action="Are you sure you want to save your changes?"   onYes={() => {saveChanges()}}   onNo={() => setSaveConfirmOpen(false)} />
      <ConfirmDialog open={deleteConfirmOpen} action="Are you sure you want to delete your account?" onYes={() => {deleteProfile()}} onNo={() => setDeleteConfirmOpen(false)} />
      <ChangePasswordDialog open={changePasswordOpen} onConfirm={(data) => {changePassword(data.oldPassword, data.newPassword)}} onCancel={() => setChangePasswordOpen(false)} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'left', mt: 10 }}>
          <Stack spacing={5} justifyContent="center" alignItems="left" sx={{ width: '100%' }}>
            <ProfileTile profileData={profile} handleChange={handleChange} editable={editable} />

            <Box width="100%" justifyContent="center" alignItems="center">
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  Delete Account
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleEditClick()}
                >
                  {editable ? "Finish Edit" : "Edit Profile"}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};