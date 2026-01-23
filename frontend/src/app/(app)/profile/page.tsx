"use client";
import React, { useEffect, useState } from "react";
import { Box, Stack, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/dialogs/ConfirmDialog";
import ChangePasswordDialog from "./components/PasswordChangeDialog";
import { checkAuthenticated, useAuth } from "@/app/(auth)/context/AuthContext";
import AlertDialog, { useDialog } from "@/app/components/dialogs/AppDialog";
import ProfileTile from "@/app/components/profileTile";
import { fetchChangeAvatar, fetchChangePassword, fetchDeleteProfile, fetchProfile, fetchSaveProfile } from "./lib/fetch";


export default function Profile() {
  const router = useRouter();
  const [editable, setEditable] = useState(false);
  const [wasChange, setWasChange] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>();

  const { dialog, show, close } = useDialog();
  const { isAuthenticated, logout } = useAuth();

  const loadProfile = () => {
    fetchProfile(setProfile);
    setWasChange(false);
  }

  useEffect(() => {
    if (!checkAuthenticated(router, isAuthenticated)) {
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (profile) {
      if (value !== profile[name as keyof typeof profile])
        setWasChange(true);

      setProfile((prev) => prev && ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (file: File) => {
    fetchChangeAvatar(file, setProfile);
  };

  const handleEditClick = () => {
    if (editable && wasChange) {
      setSaveConfirmOpen(true);
    }
    setEditable(!editable);
  };

  const saveChanges = () => {
    fetchSaveProfile(profile, setProfile);
    setSaveConfirmOpen(false);
  };

  const deleteProfile = () => {
    fetchDeleteProfile(router, logout, show);
    setDeleteConfirmOpen(false);
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    fetchChangePassword(oldPassword, newPassword, show);
    setChangePasswordOpen(false);
  };

  return (
    profile &&
    <>
      <AlertDialog {...dialog} onClose={close} />
      <ConfirmDialog
        open={saveConfirmOpen}
        action="Are you sure you want to save your changes?"
        onYes={() => { saveChanges() }}
        onNo={() => {
          loadProfile();
          setSaveConfirmOpen(false)
        }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        action="Are you sure you want to delete your account?"
        onYes={() => { deleteProfile() }}
        onNo={() => setDeleteConfirmOpen(false)}
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        onConfirm={(data) => { changePassword(data.oldPassword, data.newPassword) }}
        onCancel={() => setChangePasswordOpen(false)}
      />
      <Box minHeight={"80vh"} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Stack spacing={5} justifyContent="center" alignItems="center">
          <ProfileTile profileData={profile} handleChange={handleChange} editable={editable} onAvatarChange={handleAvatarChange} />

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
      </Box>
    </>
  );
};