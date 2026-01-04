import { useState } from "react";
import { Comment } from "./lib/types";
import { Box, Button, Stack, TextField } from "@mui/material";
import { uploadReply } from "./lib/fetch";


type ReplyInputProps = {
  setShowReplyInput: React.Dispatch<React.SetStateAction<boolean>>
  parentComment: Comment
  setParentComment: React.Dispatch<React.SetStateAction<Comment>>
}

export function ReplyInput(
  { setShowReplyInput, parentComment, setParentComment }: ReplyInputProps
) {
  const [replyText, setReplyText] = useState("");

  return (
    <Box sx={{ mt: 1 }}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        size="small"
        placeholder="Write your reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="contained"
          disabled={!replyText.trim()}
          onClick={() => {
            uploadReply(parentComment, setParentComment, replyText);
            setReplyText("");
            setShowReplyInput(false);
          }}
        >
          Add
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setReplyText("");
            setShowReplyInput(false);
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}