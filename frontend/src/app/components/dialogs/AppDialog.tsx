import * as React from "react";
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

export enum DialogType {
  WARNING = "warning",
  ERROR = "error",
  INFO = "info",
}

export type ShowDialog = (message: string, type: DialogType) => void;


type DialogState = {
  open: boolean,
  message: string,
  type: DialogType
}


export function useDialog() {
  const [dialog, setDialog] = React.useState<DialogState>({
    open: false,
    message: '',
    type: DialogType.INFO,
  });

  const show = (message: string, type: DialogType) =>
    setDialog({ open: true, message, type });

  const close = () =>
    setDialog(d => ({ ...d, open: false }));

  return { dialog, show, close };
}


type AlertDialogProps = {
  type: DialogType;
  open: boolean;
  message: string;
  onClose: () => void;
}


const DIALOG_CONFIG: Record<
  DialogType,
  { title: string; buttonColor?: "inherit" | "primary" | "error" }
> = {
  [DialogType.WARNING]: {
    title: "Warning",
    buttonColor: "primary",
  },
  [DialogType.ERROR]: {
    title: "Error",
    buttonColor: "error",
  },
  [DialogType.INFO]: {
    title: "Information",
    buttonColor: "primary",
  },
};


export default function AlertDialog({
  type,
  open,
  message,
  onClose,
}: AlertDialogProps) {
  const { title, buttonColor } = DIALOG_CONFIG[type];

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      aria-labelledby="app-dialog-title"
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            minWidth: 400,
            minHeight: 180,
          },
        },
      }}
    >
      <DialogTitle id="app-dialog-title">
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ whiteSpace: "pre-line" }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          color={buttonColor}
          autoFocus
        >
          Close
        </Button>
      </DialogActions>
    </MuiDialog>
  );
}
