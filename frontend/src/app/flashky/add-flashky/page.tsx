"use client";
import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'

import ImageIcon from "@mui/icons-material/Image";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import MovieIcon from "@mui/icons-material/Movie";

export default function NewFlashky() {
  return (
    <Paper sx={{ p: 3, mx: "auto" }}>
      <Typography variant="h4" mb={2}>
        Create new Flashky
      </Typography>
      <Grid container spacing={2}>
        { /* Tags */}
        <Grid size={2}>
          <Stack spacing={2}>
            <TextField label="Name" size="small" />
            <Tags />
          </Stack>
        </Grid>

        { /* Front */}
        <Grid size={4}><CardEditor side='front' media={
          [
            { name: "name1.jpg", url: "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png", type: "photo" },
            { name: "name1.mp3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", type: "audio" },
            { name: "name1.mp4", url: "https://www.w3schools.com/html/mov_bbb.mp4", type: "video" }
          ]} /></Grid>

        { /* Back */}
        <Grid size={4}><CardEditor side='back' media={[
          { name: "name2.jpg", url: "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png", type: "photo" },
          { name: "name2.mp3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", type: "audio" },
          { name: "name2.mp4", url: "https://www.w3schools.com/html/mov_bbb.mp4", type: "video" }
        ]} /></Grid>

        { /* Decks */}
        <Grid size={2}><Decks /></Grid>
      </Grid>

      {/* Footer */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button color="inherit">CANCEL</Button>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Add next</Button>
          <Button variant="contained">Add & finish</Button>
        </Stack>
      </Box>
    </Paper>
  )

  function Tags() {
    return (
      <Box>
        <Typography variant="subtitle2" mb={1}>Tags</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {/* TODO: CHANGE TO INTERACTIVE LOOP */}
          <Chip label="tag1" onDelete={() => { }} />
          <Chip label="tag2" onDelete={() => { }} />
        </Stack>
        <Button size="small" sx={{ mt: 1 }}>
          + tag
        </Button>
      </Box>
    )
  }

  type MediaProps = {
    name: string;
    url: string;
    type: "audio" | "video" | "photo";
  }
  type CardEditorProps = {
    side: string;
    media: MediaProps[];
  }
  function CardEditor({ side, media }: CardEditorProps) {
    return (
      <Paper variant="outlined" sx={{ p: 2, height: 600, display: "flex", flexDirection: "column" }}>
        <TextField
          multiline
          placeholder='Text content'
          minRows={6}
          fullWidth
          variant='standard'
          sx={{ flexGrow: 1 }}
        />
        <Button size="small" sx={{ mt: 1 }}>
          +
        </Button>
        <Divider sx={{ my: 1 }} />
        <Stack spacing={0.5}>
          {media.map((mediaItem, _) => <MediaItem name={mediaItem.name} url={mediaItem.url} type={mediaItem.type} />)}
        </Stack>
        <Typography variant="caption">{side}</Typography>
      </Paper>
    )
  }

  function MediaItem({ name, url, type }: MediaProps) {
    const getIcon = (type: string) => {
      if (type === 'photo') return <ImageIcon fontSize="inherit" />;
      if (type === 'audio') return <MusicNoteIcon fontSize="inherit" />;
      if (type === 'video') return <MovieIcon fontSize="inherit" />;
      return null;
    };
    const renderPreview = () => {
      switch (type) {
        case "photo":
          return (
            <Box
              component="img"
              src={url}
              alt={name}
              sx={{ width: 200, height: 110, objectFit: "fill", borderRadius: 1 }}
            />
          );
        case "audio":
          return <audio controls src={url} style={{ height: 32, width: 200 }} />;
        case "video":
          return <video src={url} width={200} height={180} controls />;
        default:
          return null;
      }
    };
    return (
      <Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {getIcon(type)}
          <Typography variant="caption" color="text.secondary">
            {name}
          </Typography>
           <Button size="small" sx={{ mt: 1 }}>X</Button>
        </Stack>
        <Box display="flex" justifyContent="center">
          {renderPreview()}
        </Box>
      </Stack>

    )
  }

  function Decks() {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" mb={1}>Decks</Typography>
        <Stack spacing={1}>
          {/* TODO: CHANGE TO INTERACTIVE LOOP */}
          <Chip label="deck1" onDelete={() => { }} />
          <Chip label="deck2" onDelete={() => { }} />
        </Stack>
        <Button size="small" sx={{ mt: 1 }}>+ Deck</Button>
      </Paper>
    )
  }
}