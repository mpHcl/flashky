"use client";
import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import ImageIcon from "@mui/icons-material/Image";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import MovieIcon from "@mui/icons-material/Movie";
import MoreIcon from '@mui/icons-material/More';
import SearchIcon from '@mui/icons-material/Search';
import { createFlashcard } from '../lib/fetch';
import { Deck } from '@/app/lib/types';
import { fetchAuthGET } from '@/app/lib/fetch';
import { useRouter } from 'next/navigation';

type MediaProps = {
  name: string;
  url: string;
  type: "audio" | "video" | "photo";
}

type CardEditorProps = {
  side: string;
  media: MediaProps[];
  textValue: string;
  textValueSetter: (value: string) => void;
  onAddMedia: () => void;
  onRemoveMedia: (index: number) => void;
}

type DeckSelectionProps = {
    selectedDecks: Deck[];
    setSelectedDecks: (list: Deck[]) => void;
}

type AddTagsProps = {
    tags: string[];
    setTags: (list: string[]) => void;
}

const MediaItem = React.memo(({ name, url, type, onRemove }: MediaProps & { onRemove: () => void }) => {
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
        <Button size="small" sx={{ mt: 1 }} onClick={onRemove}>X</Button>
      </Stack>
      <Box display="flex" justifyContent="center">
        {renderPreview()}
      </Box>
    </Stack>
  );
});

MediaItem.displayName = 'MediaItem';

const CardEditor = React.memo(({ side, media, textValue, textValueSetter, onAddMedia, onRemoveMedia }: CardEditorProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: 600, display: "flex", flexDirection: "column" }}>
      <TextField
        multiline
        placeholder='Text content'
        minRows={6}
        fullWidth
        variant='standard'
        value={textValue}
        onChange={(e) => textValueSetter(e.target.value)}
        sx={{ flexGrow: 1 }}
      />
      <Button size="small" sx={{ mt: 1 }} onClick={onAddMedia}>
        +
      </Button>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={0.5} sx={{ minHeight: 100 }}>
        {media.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No media added yet
          </Typography>
        ) : (
          media.map((mediaItem, idx) => (
            <MediaItem
              key={`${mediaItem.name}-${idx}`}
              name={mediaItem.name}
              url={mediaItem.url}
              type={mediaItem.type}
              onRemove={() => onRemoveMedia(idx)}
            />
          ))
        )}
      </Stack>
      <Typography variant="caption">{side}</Typography>
    </Paper>
  );
});

CardEditor.displayName = 'CardEditor';

const DeckSelection = React.memo(({ selectedDecks, setSelectedDecks }: DeckSelectionProps) => {
    const [queryString, setQueryString] = React.useState("");
    const [searchDecks, setSearchDecks] = React.useState<Deck[]>([]);
    const TOOLTIP_LENGTH = 50;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && queryString.trim()) {
            const onSuccess = async (response: Response) => {
                const result = await response.json();
                setSearchDecks(result.decks);
            }

            fetchAuthGET("decks/mydecks?q=" + queryString, 200, onSuccess);
        }
    }

    const handleSelectDeck = (index: number) => {
        if (!selectedDecks.some(d => d.id === searchDecks[index].id)) {
            setSelectedDecks([...selectedDecks, searchDecks[index]]);
        }
    }

    const deleteSelectedDeck = (id: number) => {
        setSelectedDecks(selectedDecks.filter(d => d.id !== id));
    }

    return <Stack spacing={2}>
        <Typography variant="h6" mb={2}>
            Add to decks
        </Typography>
        <Box>
            {selectedDecks.map((el, index) =>
                <Chip key={index} label={el.name} sx={{ m: 0.25 }} onDelete={(e) => deleteSelectedDeck(el.id)} />)}
        </Box>
        <TextField
            placeholder="Find decks"
            fullWidth size="small"
            variant="outlined"
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                },
            }} />
        <List>
            {searchDecks.map((el, index) =>
                <ListItemButton key={el.id} onClick={(e) => handleSelectDeck(index)}>
                        <ListItemText primary={el.name} />
                    <Tooltip title={
                        <React.Fragment>
                            <b>{'Description: '}</b> {el.description == null ? "" : (el.description.length > TOOLTIP_LENGTH ? el.description.substring(0, TOOLTIP_LENGTH) + "..." : el.description)}
                        </React.Fragment>
                    } placement="bottom" enterDelay={500}>
                        <ListItemIcon><MoreIcon/></ListItemIcon>
                    </Tooltip>
                </ListItemButton>)}
        </List>
    </Stack>
});

DeckSelection.displayName = "DeckSelection";

const AddTags = React.memo(({ tags, setTags }: AddTagsProps) => {
    const [newTag, setNewTag] = React.useState("");

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && newTag.trim()) {
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setNewTag("");
        }
    }

    const deleteTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    }

    return <>
        <Typography variant="h6" mb={2}>
            Add tags
        </Typography>
        <TextField
            variant="outlined"
            label="Enter tag name"
            size="small"
            value={newTag ?? ""}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown} />
        <Box>
            {tags.map((tag, index) =>
                <Chip key={index} label={tag} sx={{ m: 0.25 }} onDelete={(e) => deleteTag(tag)} />)}
        </Box>
    </>
})

AddTags.displayName = "AddTags";

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
  );
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
  );
}

export default function NewFlashky() {
  const router = useRouter();
  const [name, setName] = React.useState<string>("")
  const [frontTextContent, setFrontTextContent] = React.useState<string>("")
  const [backTextContent, setBackTextContent] = React.useState<string>("")

  const [frontMedia, setFrontMedia] = React.useState<MediaProps[]>([])
  const [backMedia, setBackMedia] = React.useState<MediaProps[]>([])

  const [frontMediaFiles, setFrontMediaFiles] = React.useState<File[]>([]);
  const [backMediaFiles, setBackMediaFiles] = React.useState<File[]>([]);

  const frontFileInputRef = React.useRef<HTMLInputElement>(null);
  const backFileInputRef = React.useRef<HTMLInputElement>(null);

  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);

  const getMediaType = (mimeType: string): "photo" | "audio" | "video" | null => {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return null;
  };

  const handleFileUpload = React.useCallback((files: FileList | null, setMedia: React.Dispatch<React.SetStateAction<MediaProps[]>>, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setFiles(prev => [...prev, ...fileArray]);

    fileArray.forEach(file => {
      const mediaType = getMediaType(file.type);

      if (!mediaType) {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }

      const url = URL.createObjectURL(file);

      setMedia(prev => [...prev, {
        name: file.name,
        url: url,
        type: mediaType
      }]);
    });
  }, []);

  const handleAddFrontMedia = React.useCallback(() => {
    frontFileInputRef.current?.click();
  }, []);

  const handleAddBackMedia = React.useCallback(() => {
    backFileInputRef.current?.click();
  }, []);

  const handleRemoveFrontMedia = React.useCallback((index: number) => {
    setFrontMedia(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    setFrontMediaFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveBackMedia = React.useCallback((index: number) => {
    setBackMedia(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    setBackMediaFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  React.useEffect(() => {
    return () => {
      frontMedia.forEach(media => URL.revokeObjectURL(media.url));
      backMedia.forEach(media => URL.revokeObjectURL(media.url));
    };
  }, []);

  return (
    <Paper sx={{ p: 3, mx: "auto" }}>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={frontFileInputRef}
        style={{ display: 'none' }}
        accept="image/*,audio/*,video/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files, setFrontMedia, setFrontMediaFiles)}
      />
      <input
        type="file"
        ref={backFileInputRef}
        style={{ display: 'none' }}
        accept="image/*,audio/*,video/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files, setBackMedia, setBackMediaFiles)}
      />

      <Typography variant="h4" mb={2}>
        Create new Flashky
      </Typography>
      <Grid container spacing={2}>
        { /* Tags */}
        <Grid size={2}>
          <Stack spacing={2}>
            <TextField
              label="Name"
              size="small"
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)} />
            <AddTags tags={tags} setTags={setTags} />
          </Stack>
        </Grid>

        { /* Front */}
        <Grid size={4}>
          <CardEditor
            side='front'
            textValue={frontTextContent}
            textValueSetter={setFrontTextContent}
            media={frontMedia}
            onAddMedia={handleAddFrontMedia}
            onRemoveMedia={handleRemoveFrontMedia}
          />
        </Grid>

        { /* Back */}
        <Grid size={4}>
          <CardEditor
            side='back'
            textValue={backTextContent}
            textValueSetter={setBackTextContent}
            media={backMedia}
            onAddMedia={handleAddBackMedia}
            onRemoveMedia={handleRemoveBackMedia}
          />
        </Grid>

        { /* Decks */}
        <Grid size={2}><DeckSelection selectedDecks={decks} setSelectedDecks={setDecks} /></Grid>
      </Grid>

      {/* Footer */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button color="inherit">CANCEL</Button>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() =>
            createFlashcard(
              name,
              frontTextContent,
              backTextContent,
              frontMediaFiles,
              backMediaFiles,
              tags,
              decks
            )}>Add next</Button>
          <Button variant="contained"  onClick={() =>{
            createFlashcard(
              name,
              frontTextContent,
              backTextContent,
              frontMediaFiles,
              backMediaFiles,
              tags,
              decks
            );
            router.push("/myflashky");}}>Add & finish</Button>
        </Stack>
      </Box>
    </Paper>
  );
}