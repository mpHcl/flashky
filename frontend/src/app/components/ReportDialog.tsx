'use client'
import React, { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { fetchAuthPOST } from "../lib/fetch";
import { RequestBodyType } from "../lib/fetchOptions";


type ReportInputPopupProps = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  object_id: number
  object_type: "deck" | "flashcard" | "comment" | "user"
}


export default function ReportInputPopup({ open, setOpen, object_id, object_type}: ReportInputPopupProps) {
  const [text, setText] = useState("");

  const sendReport = async () => {
    const body = {
      "type": object_type, 
      "description": text, 
      "item_id": object_id
    }
    const onSuccess = async () => {
      setOpen(false);
    }
    fetchAuthPOST("reports", 200, RequestBodyType.JSON, body, onSuccess)
  }

  const handleSend = () => {
    if (!text.trim()) return;
    sendReport();
    setText("");
  };

  const handleCancel = () => {
    setText("");
    setOpen(false);
  };


  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Report an element</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Description"
          placeholder="Write your report here..."
          fullWidth
          multiline
          minRows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!text.trim()}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}