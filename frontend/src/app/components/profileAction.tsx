import React, { useState } from "react";
import { Box, Button, TextField, Typography, Stack } from "@mui/material";

interface ProfileActionProps {
    action: "none" | "change_password" | "edit" | "delete";
}
export default function ProfileActions({ action }: ProfileActionProps){
  const activeAction = action;

  return (
    <Box>
      <Box>
        {activeAction === "none" && (
          <Typography variant="h6">Select an action above to proceed.</Typography>
        )}
        {activeAction === "edit" && (
          <Typography variant="h6">edit.</Typography>
        )}
        {activeAction === "change_password" && (
          <Typography variant="h6">change password.</Typography>
        )}
        {activeAction === "delete" && (
            <Typography variant="h6">delete.</Typography>
        )}
      </Box>
    </Box>
  );
};