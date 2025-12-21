"use client";
import React, { useEffect, useState } from "react";
import { Box, Stack, Button, useRadioGroup } from "@mui/material";
import ProfileTile from "../components/profileTile";
import ConfirmDialog from "../components/confirmDialog";
import ChangePasswordDialog from "./changePasswordDialog";
import { fetchAuthDELETE, fetchAuthGET, fetchAuthPUT, OK } from "../lib/fetch";
import { logoutFetch } from "../(auth)/lib/fetch";
import { useRouter } from "next/navigation";
import { error } from "console";

export default function Profile() {
  const router = useRouter();
  const [editable, setEditable] = useState(false);
  const [wasChange, setWasChange] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profile, setProfile] = useState({
    username: "Loading...",
    email: "Loading...",
    avatar: "",
    description: "Loading...",
    creation_date: "Loading...",
    verified: false,
    active: false,
  });

  const loadProfile = () => {
    const onSuccess = async (response: Response) => {
      const result = await response.json();
      if (result.description === null)
        result.description = "";
      
      setProfile(result);
    }

    fetchAuthGET("users/me", OK, onSuccess);
    setWasChange(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(name, value);
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
    const data = {
      username: profile.username,
      email: profile.email,
      description: profile.description,
    }

    const onSuccess = async (response: Response) => {
      const result = await response.json();
      setProfile(result);
    }
    fetchAuthPUT("users/me", OK, data, onSuccess);

    setSaveConfirmOpen(false);
  };

  const deleteProfile = () => {
    const onSuccess = async (response: Response) => {
      logoutFetch(router);
    }

    const onFail = async (response: Response) => {
      alert("Failed to delete profile");
    }
    
    fetchAuthDELETE("users/me", OK, onSuccess, onFail);

    setDeleteConfirmOpen(false);
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    const onSuccess = async (response: Response) => {
      alert("Password changed successfully");
    }

    const onFail = async (response: Response) => {
      await response.json().then(results => {
        var errorsString = "";
        if (results.detail.errors !== undefined) {
          results.detail.errors.forEach((error: string) => {
            errorsString += error + "\n";
          });
        }
        else {
          errorsString = results.detail;
        }

        alert("Failed to change password\nDetails:\n" + errorsString);
      });
    }

    const data = { old_password: oldPassword.trim(), new_password: newPassword.trim() };
    fetchAuthPUT("users/change_password", OK, data, onSuccess, onFail);

    setChangePasswordOpen(false);
  };

  return (
    <>
      <ConfirmDialog open={saveConfirmOpen} action="Are you sure you want to save your changes?" onYes={() => { saveChanges() }} onNo={() => {loadProfile(); setSaveConfirmOpen(false)}} />
      <ConfirmDialog open={deleteConfirmOpen} action="Are you sure you want to delete your account?" onYes={() => { deleteProfile() }} onNo={() => setDeleteConfirmOpen(false)} />
      <ChangePasswordDialog open={changePasswordOpen} onConfirm={(data) => { changePassword(data.oldPassword, data.newPassword) }} onCancel={() => setChangePasswordOpen(false)} />
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