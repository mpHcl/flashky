"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { getUser, fetchDeactivateUser, fetchActivateUser } from "../lib/fetch";
import AlertDialog, { useDialog } from "@/app/components/dialogs/AppDialog";
import ConfirmDialog from "@/app/components/dialogs/ConfirmDialog";
import ProfileTile from "@/app/components/profileTile";
import { User } from "../lib/types";
import { checkAuthenticated, useAuth } from "@/app/(auth)/context/AuthContext";

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const [user, setUser] = useState<User>();
  const { dialog, show, close } = useDialog();
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [activateConfirmOpen, setActivateConfirmOpen] = useState(false);

  const loadUser = () => {
    getUser(setUser, userId);
  }

  const deactivateUser = () => {
    fetchDeactivateUser(userId, setUser, show);
    setDeactivateConfirmOpen(false);
  }

  const activateUser = () => {
    fetchActivateUser(userId, setUser, show);
    setActivateConfirmOpen(false);
  }

  useEffect(() => {
    if (!checkAuthenticated(router, isAuthenticated)) {
      return;
    }

    loadUser();
  }, [isAuthenticated, loadUser]);

  return (
    user &&
    <>
      <AlertDialog {...dialog} onClose={close} />
      { user.active ?
        (
          <ConfirmDialog
            open={deactivateConfirmOpen}
            action="Are you sure you want to deactivate this user?"
            onYes={() => deactivateUser()}
            onNo={() => setDeactivateConfirmOpen(false)}
          />
        ) :
        (
          <ConfirmDialog
            open={activateConfirmOpen}
            action="Are you sure you want to activate this user?"
            onYes={() => activateUser()}
            onNo={() => setActivateConfirmOpen(false)}
          />
        )
      }
      <ConfirmDialog
        open={deactivateConfirmOpen}
        action="Are you sure you want to deactivate this user?"
        onYes={() => { deactivateUser() }}
        onNo={() => setDeactivateConfirmOpen(false)}
      />
      <Box minHeight={"50vh"} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Stack spacing={5} justifyContent="center" alignItems="center">
          <ProfileTile profileData={user} editable={false} handleChange={() => { }} />

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => router.back()}>
              Back
            </Button>
            {user.active ?
            (
              <Button variant="contained" color="error" onClick={() => setDeactivateConfirmOpen(true)}>
                Deactivate User
              </Button>
            ):
            (
              <Button variant="contained" color="success" onClick={() => setActivateConfirmOpen(true)}>
                Activate User
              </Button>
            )
            }
          </Stack>
        </Stack>
      </Box>
    </>
  );
};