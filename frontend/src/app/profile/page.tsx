"use client";
import React, { useEffect, useState } from "react";
import { Box, Stack, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import ProfileTile from "../components/ProfileTile";
import ConfirmDialog from "../components/dialogs/ConfirmDialog";
import ChangePasswordDialog from "./components/PasswordChangeDialog";
import { fetchChangePassword, fetchDeleteProfile, fetchProfile, fetchSaveProfile } from "./lib/fetch";
import { useAuth } from "../(auth)/context/AuthContext";
import AlertDialog, { useDialog } from "../components/dialogs/AppDialog";


export default function Profile() {
  const router = useRouter();
  const [editable, setEditable] = useState(false);
  const [wasChange, setWasChange] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>();

  const { dialog, show, close } = useDialog();
  const { logout } = useAuth();

  const loadProfile = () => {
    fetchProfile(setProfile);
    setWasChange(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (profile) {
      if (value !== profile[name as keyof typeof profile])
        setWasChange(true);

      setProfile((prev) => prev && ({ ...prev, [name]: value }));
    }
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
      </Box>
    </>
  );
};