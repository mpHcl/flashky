import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";

interface ChangePasswordDialogProps {
  open: boolean;
  onConfirm: (data: { oldPassword: string; newPassword: string }) => void;
  onCancel: () => void;
}

export default function ChangePasswordDialog({ open, onConfirm, onCancel } : ChangePasswordDialogProps) {
  const [form, setForm] = React.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleYesClick = () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    onConfirm({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });

    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleNoClick = () => {
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setError("");
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleNoClick} maxWidth="xs" fullWidth>
      <DialogTitle>Change Password</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Old Password"
            name="oldPassword"
            type="password"
            value={form.oldPassword}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="New Password"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={!!error}
            helperText={error}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleNoClick} color="inherit">
          No
        </Button>
        <Button
          onClick={handleYesClick}
          variant="contained"
          color="primary"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}