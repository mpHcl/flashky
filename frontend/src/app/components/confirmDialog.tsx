import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  action: string;
  onYes: () => void;
  onNo: () => void;
}

export default function ConfirmDialog({ open, action, onYes, onNo } : ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onNo}
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title">
        Confirm Action
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {action}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onNo} color="inherit">
          No
        </Button>
        <Button onClick={onYes} variant="contained" color="primary" autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}