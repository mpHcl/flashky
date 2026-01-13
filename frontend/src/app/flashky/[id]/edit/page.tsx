"use client";
import * as React from 'react'
import {
  Box,
  Button,
  Card,
  CardMedia,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
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
import { editFlashcard } from '../../lib/fetch';
import { Deck, Flashcard, MediaInfo } from '@/app/lib/types';
import { fetchAuthGET } from '@/app/lib/fetch';
import { useParams, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { BASE_URL } from '@/app/constants';
import { checkAuthenticated, useAuth } from '@/app/(auth)/context/AuthContext';

type ExistingMediaProps = {
  flashcardSideId: number;
  mediaInfos: MediaInfo[];
  setMediaInfos: (list: MediaInfo[]) => void;
  mediaToRemove: number[];
  setMediaToRemove: (list: number[]) => void;
}

type MediaProps = {
  name: string;
  url: string;
  type: "audio" | "video" | "photo";
}

type CardEditorProps = {
  side: string;
  flashcardSideId: number;
  media: MediaProps[];
  textValue: string;
  textValueSetter: (value: string) => void;
  onAddMedia: () => void;
  onRemoveMedia: (index: number) => void;
  mediaInfos: MediaInfo[];
  setMediaInfos: (list: MediaInfo[]) => void;
  mediaToRemove: number[];
  setMediaToRemove: (list: number[]) => void;
}

type DeckSelectionProps = {
  selectedDecks: Deck[];
  setSelectedDecks: (list: Deck[]) => void;
  decksToAdd: Deck[];
  setDecksToAdd: (list: Deck[]) => void;
  decksToRemove: Deck[];
  setDecksToRemove: (list: Deck[]) => void;
}

type AddTagsProps = {
  tags: string[];
  setTags: (list: string[]) => void;
  tagsToAdd: string[];
  setTagsToAdd: (list: string[]) => void;
  tagsToRemove: string[];
  setTagsToRemove: (list: string[]) => void;
}

const getMediaInfos = async (
  flashcard_side_id: number,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setMediaInfos: (list: MediaInfo[]) => void
) => {
  setLoading(true);
  const onSuccess = async (response: Response) => {
    const result = await response.json();
    setMediaInfos(result);
  }
  fetchAuthGET(`media/side/${flashcard_side_id}`, 200, onSuccess);
  setLoading(false);
};

const ExistingMedia = React.memo(({ flashcardSideId, mediaInfos, setMediaInfos, mediaToRemove, setMediaToRemove }: ExistingMediaProps) => {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    getMediaInfos(flashcardSideId, setLoading, setMediaInfos);
  }, [flashcardSideId]);

  const handleChangeAlt = async (id: number, value: string) => {
    setMediaInfos(mediaInfos.map(info => {
      if (info.id === id) {
        return { ...info, alt: value };
      }
      else {
        return info;
      }
    }))
  }

  const handleChangeAutoplay = async (id: number, value: boolean) => {
    setMediaInfos(mediaInfos.map(info => {
      if (info.id === id) {
        return { ...info, autoplay: value };
      }
      else {
        return info;
      }
    }))
  }

  const removeMedia = async (id: number) => {
    setMediaInfos(mediaInfos.filter(info => info.id !== id));
    setMediaToRemove([...mediaToRemove, id]);
  }

  const renderMedia = (media: MediaInfo, src: string, numOfElements: number) => {
    switch (media.type) {
      case "image":
        return (
          <CardMedia
            component="img"
            image={src}
            alt={media.alt}
            sx={{ height: numOfElements !== 1 ? 40 : 40, objectFit: "contain" }}
          />
        );

      case "video":
        return (
          <CardMedia
            component="video"
            src={src}
            controls
            sx={{ height: numOfElements !== 1 ? 40 : 40 }}
            autoPlay={false}
          />
        );

      case "audio":
        return (
          <Box sx={{ p: 2 }}>
            <CardMedia component="audio" src={src} controls autoPlay={false} />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {loading ?
        <>Loading</> :
        <Grid container spacing={2}>
          {mediaInfos?.map((media) => {
            const src = `${BASE_URL}media/file/${media.id}`;

            return (
              <Grid key={media.id} size={12}>
                <Card
                  elevation={2}
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                  }}
                >
                  {/* Media */}
                  {renderMedia(media, src, mediaInfos.length)}
                  <TextField
                    placeholder='alt text'
                    label="Alt text"
                    size="small"
                    value={media.alt ?? ""}
                    onChange={(e) => handleChangeAlt(media.id, e.target.value)}
                  />
                  <FormControlLabel control={<Checkbox disabled={media.type === "image"} onChange={(e) => handleChangeAutoplay(media.id, e.target.checked)} />} label="Autoplay" />
                  <Button sx={{ mt: 1 }} onClick={(e) => removeMedia(media.id)}>X</Button>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      }
    </>
  )
})

ExistingMedia.displayName = "ExistingMedia";

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

const CardEditor = React.memo(({ side, flashcardSideId, media, textValue, textValueSetter, onAddMedia, onRemoveMedia, mediaInfos, setMediaInfos, mediaToRemove, setMediaToRemove }: CardEditorProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: 600, display: "flex", flexDirection: "column", overflow: 'auto' }}>
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
      <ExistingMedia flashcardSideId={flashcardSideId} mediaInfos={mediaInfos} setMediaInfos={setMediaInfos} mediaToRemove={mediaToRemove} setMediaToRemove={setMediaToRemove} />
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

const DeckSelection = React.memo(({ selectedDecks, setSelectedDecks, decksToAdd, setDecksToAdd, decksToRemove, setDecksToRemove }: DeckSelectionProps) => {
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
    const id = searchDecks[index].id;
    if (!selectedDecks.some(d => d.id === id)) {
      setSelectedDecks([...selectedDecks, searchDecks[index]]);
      if (decksToRemove.some(d => d.id === id)) { // if true, the deck is being added to back in the same edit
        setDecksToRemove(decksToRemove.filter(d => d.id !== id));
      }
      else { // this is a new deck being added to
        setDecksToAdd([...decksToAdd, searchDecks[index]]);
      }
    }
  }

  const deleteSelectedDeck = (deck: Deck) => {
    const id = deck.id;
    setSelectedDecks(selectedDecks.filter(d => d.id !== id));
    if (decksToAdd.some(d => d.id === id)) { // if true, this deck is not being added to after all
      setDecksToAdd(decksToAdd.filter(d => d.id !== id));
    }
    else { // remove from this deck
      setDecksToRemove([...decksToRemove, deck]);
    }
  }

  return <Stack spacing={2}>
    <Typography variant="h6" mb={2}>
      Add to decks
    </Typography>
    <Box>
      {selectedDecks.map((el, index) =>
        <Chip key={index} label={el.name} sx={{ m: 0.25 }} onDelete={(e) => deleteSelectedDeck(el)} />)}
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
            <ListItemIcon><MoreIcon /></ListItemIcon>
          </Tooltip>
        </ListItemButton>)}
    </List>
  </Stack>
});

DeckSelection.displayName = "DeckSelection";

const AddTags = React.memo(({ tags, setTags, tagsToAdd, setTagsToAdd, tagsToRemove, setTagsToRemove }: AddTagsProps) => {
  const [newTag, setNewTag] = React.useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        if (tagsToRemove.includes(newTag)) // if true, the tag is being added back in the same edit
        {
          setTagsToRemove(tagsToRemove.filter(t => t !== newTag));
        }
        else // this is a new tag
        {
          setTagsToAdd([...tagsToAdd, newTag]);
        }
      }
      setNewTag("");
    }
  }

  const deleteTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
    if (tagsToAdd.includes(tag)) // if true, this tag is not being added after all
    {
      setTagsToAdd(tagsToAdd.filter(t => t !== tag));
    }
    else // remove this tag
    {
      setTagsToRemove([...tagsToRemove, tag]);
    }
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

export default function EditFlashky() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [flashcard, setFlashcard] = React.useState<Flashcard>();
  const [name, setName] = React.useState<string>("")
  const [frontTextContent, setFrontTextContent] = React.useState<string>("")
  const [backTextContent, setBackTextContent] = React.useState<string>("")

  const [frontMedia, setFrontMedia] = React.useState<MediaProps[]>([])
  const [backMedia, setBackMedia] = React.useState<MediaProps[]>([])

  const [frontMediaFiles, setFrontMediaFiles] = React.useState<File[]>([]);
  const [backMediaFiles, setBackMediaFiles] = React.useState<File[]>([]);

  const frontFileInputRef = React.useRef<HTMLInputElement>(null);
  const backFileInputRef = React.useRef<HTMLInputElement>(null);

  const [frontMediaIds, setFrontMediaIds] = React.useState<number[]>([]);
  const [backMediaIds, setBackMediaIds] = React.useState<number[]>([]);
  const [frontMediaToUpdate, setFrontMediaToUpdate] = React.useState<MediaInfo[]>([]);
  const [backMediaToUpdate, setBackMediaToUpdate] = React.useState<MediaInfo[]>([]);
  const [frontMediaIdsToRemove, setFrontMediaIdsToRemove] = React.useState<number[]>([]);
  const [backMediaIdsToRemove, setBackMediaIdsToRemove] = React.useState<number[]>([]);

  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [decksToAdd, setDecksToAdd] = React.useState<Deck[]>([]);
  const [decksToRemove, setDecksToRemove] = React.useState<Deck[]>([]);

  const [tags, setTags] = React.useState<string[]>([]);
  const [tagsToAdd, setTagsToAdd] = React.useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = React.useState<string[]>([]);

  const { isAuthenticated } = useAuth();


  React.useEffect(() => {
    if (!checkAuthenticated(router, isAuthenticated)) {
      return;
    }
    const onSuccess = async (response: Response) => {
      const result = await response.json();
      setFlashcard(result);
      setName(result.name);
      setFrontTextContent(result.front_side.content);
      setBackTextContent(result.back_side.content);
      setTags(result.tags);
      setFrontMediaIds(result.front_side.media);
      setBackMediaIds(result.back_side.media);
    }

    fetchAuthGET("flashcards/" + id, 200, onSuccess);

    const onSuccessDeck = async (response: Response) => {
      const result = await response.json();
      result.decks.map((d: Deck) => {
        setDecks([...decks, d]);
      })
    }

    fetchAuthGET("decks?flashcard_id=" + id, 200, onSuccessDeck);
  }, [isAuthenticated]);

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
    flashcard && <Paper sx={{ p: 3, mx: "auto" }}>
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
        Edit Flashky
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
            <AddTags tags={tags} setTags={setTags} tagsToAdd={tagsToAdd} setTagsToAdd={setTagsToAdd} tagsToRemove={tagsToRemove} setTagsToRemove={setTagsToRemove} />
          </Stack>
        </Grid>

        { /* Front */}
        <Grid size={4}>
          <CardEditor
            side='front'
            flashcardSideId={flashcard.front_side.id}
            textValue={frontTextContent}
            textValueSetter={setFrontTextContent}
            media={frontMedia}
            onAddMedia={handleAddFrontMedia}
            onRemoveMedia={handleRemoveFrontMedia}
            mediaInfos={frontMediaToUpdate}
            setMediaInfos={setFrontMediaToUpdate}
            mediaToRemove={frontMediaIdsToRemove}
            setMediaToRemove={setFrontMediaIdsToRemove}
          />
        </Grid>

        { /* Back */}
        <Grid size={4}>
          <CardEditor
            side='back'
            flashcardSideId={flashcard.back_side.id}
            textValue={backTextContent}
            textValueSetter={setBackTextContent}
            media={backMedia}
            onAddMedia={handleAddBackMedia}
            onRemoveMedia={handleRemoveBackMedia}
            mediaInfos={backMediaToUpdate}
            setMediaInfos={setBackMediaToUpdate}
            mediaToRemove={backMediaIdsToRemove}
            setMediaToRemove={setBackMediaIdsToRemove}
          />
        </Grid>

        { /* Decks */}
        <Grid size={2}><DeckSelection selectedDecks={decks} setSelectedDecks={setDecks} decksToAdd={decksToAdd} setDecksToAdd={setDecksToAdd} decksToRemove={decksToRemove} setDecksToRemove={setDecksToRemove} /></Grid>
      </Grid>

      {/* Footer */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button color="inherit">CANCEL</Button>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => {
            editFlashcard(
              flashcard.id,
              name,
              frontTextContent,
              backTextContent,
              frontMediaFiles,
              backMediaFiles,
              frontMediaToUpdate,
              backMediaToUpdate,
              frontMediaIdsToRemove,
              backMediaIdsToRemove,
              tagsToAdd,
              tagsToRemove,
              decksToAdd,
              decksToRemove
            );
            router.push("/flashky/" + id);
          }}>Edit</Button>
        </Stack>
      </Box>
    </Paper>
  );
}