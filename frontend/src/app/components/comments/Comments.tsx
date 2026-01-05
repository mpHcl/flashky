'use client';

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";


import { Comment } from "./lib/types";
import { getComments } from "./lib/fetch";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";


type CommentsProps = {
  deck_id: number
}

export default function Comments({ deck_id }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>();

  useEffect(() => {
    getComments(deck_id, setComments);
  }, [])

  return comments && (
    <Box>
      <CommentInput
        deck_id={deck_id}
        setComments={setComments}
      />
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          depth={0}
          showChildren={true}
        />
      ))}
    </Box>
  );
}