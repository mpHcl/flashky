import { useState } from "react";
import { Comment } from "./lib/types";
import { Box, Button, Stack, TextField } from "@mui/material";
import { uploadNewComment } from "./lib/fetch";


type NewCommentProps = {
    deck_id: number
    setComments: React.Dispatch<React.SetStateAction<Comment[] | undefined>>
}

export function CommentInput(
    { deck_id, setComments }: NewCommentProps
) {
    const [text, setText] = useState("");

    return (
        <Box sx={{ mt: 1 }}>
            <TextField
                fullWidth
                multiline
                minRows={3}
                size="small"
                placeholder="Write your comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                    size="small"
                    variant="contained"
                    disabled={!text.trim()}
                    onClick={() => {
                        uploadNewComment(deck_id, setComments, text);
                        setText("");
                    }}
                >
                    Add
                </Button>

                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        setText("");
                    }}
                >
                    Cancel
                </Button>
            </Stack>
        </Box>
    );
}