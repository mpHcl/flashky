'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

import { Comment } from "./lib/types";
import { getCommentChildren } from "./lib/fetch";
import { ReplyInput } from "./ReplyInput";


type CommentItemProps = {
  comment: Comment
  depth: number
  showChildren: boolean
}

export function CommentItem({ comment, depth = 0, showChildren }: CommentItemProps) {
  const [currentComment, setCurrentComment] = useState(comment);
  const [showChildrenState, setShowChildrenState] = useState(showChildren);
  const [showReplyInput, setShowReplyInput] = useState(false);

  useEffect(
    () => {
      if (showChildrenState) {
        if (currentComment.children.length === 0 && currentComment.children_ids.length > 0) {
          getCommentChildren(currentComment, setCurrentComment);
        }
      }
    }
    , [showChildrenState])

  return currentComment && (
    <Box sx={{ ml: depth * 4, mt: 2 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={600}>
              {currentComment.author_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(currentComment.creation_date + "Z").toLocaleString()}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
            {currentComment.content}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={() => {
                setShowReplyInput(!showReplyInput);
              }}
            >
              Reply
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => { console.log("REPORT"); }}
            >
              Report
            </Button>
            { showChildrenState && currentComment.children.length !== 0 && 
              <Button
                size="small"
                sx={{color: "lightblue"}}
                onClick={() => setShowChildrenState(!showChildrenState)}
              >
                Hide replies
              </Button>
            }
            {((currentComment.children?.length > 0 && !(showChildrenState)) || (currentComment.children.length === 0 && currentComment.children_ids.length > 0)) && (
          <Box sx={{ mt: 2 }}>
            <Button
              sx={{color: "lightblue"}}
              size="small"
              onClick={() => { setShowChildrenState(true); }}
            >
              Load replies
            </Button>
          </Box>
        )}
          </Stack>

          {showReplyInput && <ReplyInput
            setShowReplyInput={setShowReplyInput}
            parentComment={currentComment}
            setParentComment={setCurrentComment}
          />}
        </Box>
      </Stack>

      {currentComment.children?.length > 0 && (showChildrenState) && (
        <Box sx={{ mt: 2 }}>
          {currentComment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              depth={depth + 1}
              showChildren={false}
            />
          ))}
        </Box>
      )}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}