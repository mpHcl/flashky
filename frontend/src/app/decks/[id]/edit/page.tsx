"use client";
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
import MoreIcon from '@mui/icons-material/More';
import SearchIcon from '@mui/icons-material/Search';
import { RequestBodyType } from '@/app/lib/fetchOptions';
import { fetchAuthGET, fetchAuthPUT } from '@/app/lib/fetch';
import { Deck, DeckUpdateDTO, Flashcard, FlashcardInDeck } from '@/app/lib/types';

type FlashcardSelectionProps = {
  selectedFlashcards: FlashcardInDeck[];
  setSelectedFlashcards: (list: FlashcardInDeck[]) => void;
  flashcardsToAdd: number[];
  setFlashcardsToAdd: (list: number[]) => void;
  flashcardsToRemove: number[];
  setFlashcardsToRemove: (list: number[]) => void;
}

type AddTagsProps = {
  tags: string[];
  setTags: (list: string[]) => void;
  tagsToAdd: string[];
  setTagsToAdd: (list: string[]) => void;
  tagsToRemove: string[];
  setTagsToRemove: (list: string[]) => void;
}

const FlashcardSelection = React.memo(({ selectedFlashcards, setSelectedFlashcards, flashcardsToAdd, setFlashcardsToAdd, flashcardsToRemove, setFlashcardsToRemove }: FlashcardSelectionProps) => {
  const [queryString, setQueryString] = React.useState("");
  const [searchFlashcards, setSearchFlashcards] = React.useState<Flashcard[]>([]);
  const TOOLTIP_LENGTH = 20;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && queryString.trim()) {
      const onSuccess = async (response: Response) => {
        const result = await response.json();
        setSearchFlashcards(result.flashcards);
      }

      fetchAuthGET("flashcards/myflashcards?q=" + queryString, 200, onSuccess);
    }
  }

  const handleSelectFlashcard = (index: number) => {
    const id = searchFlashcards[index].id;
    if (!selectedFlashcards.some(f => f.id === id)) { // check if the flashcard is not already selected
      setSelectedFlashcards([...selectedFlashcards, { id: id, name: searchFlashcards[index].name, creation_date: new Date(searchFlashcards[index].creation_date) }]);
      if (flashcardsToRemove.includes(id)) { // if true, the flashcard is being added back in the same edit
        setFlashcardsToRemove(flashcardsToRemove.filter(f => f !== id));
      }
      else { // this is a new flashcard
        setFlashcardsToAdd([...flashcardsToAdd, id]);
      }
    }
  }

  const deleteSelectedFlashcard = (id: number) => {
    setSelectedFlashcards(selectedFlashcards.filter(f => f.id !== id));
    if (flashcardsToAdd.includes(id)) { // if true, this flashcard is not being added after all
      setFlashcardsToAdd(flashcardsToAdd.filter(f => f !== id));
    }
    else { // remove this flashcard
      setFlashcardsToRemove([...flashcardsToRemove, id]);
    }
  }

  return <Stack spacing={2}>
    <Typography variant="h6" mb={2}>
      Add flashcards
    </Typography>
    <Box>
      {selectedFlashcards.map((el, index) =>
        <Chip key={index} label={el.name} sx={{ m: 0.25 }} onDelete={(e) => deleteSelectedFlashcard(el.id)} />)}
    </Box>
    <TextField
      placeholder="Find flashcards"
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
      {searchFlashcards.map((el, index) =>
        <ListItemButton key={el.id} onClick={(e) => handleSelectFlashcard(index)}>
          <ListItemText primary={el.name} />
          <Tooltip title={
            <React.Fragment>
              <b>{'Front content: '}</b> {el.front_side.content == null ? "" : (el.front_side.content.length > TOOLTIP_LENGTH ? el.front_side.content.substring(0, TOOLTIP_LENGTH) + "..." : el.front_side.content)} <br />
              <b>{'Back content: '}</b> {el.back_side.content == null ? "" : (el.back_side.content.length > TOOLTIP_LENGTH ? el.back_side.content.substring(0, TOOLTIP_LENGTH) + "..." : el.back_side.content)} <br />
              <b>{el.front_side.media.length + el.back_side.media.length} media</b>
            </React.Fragment>
          } placement="bottom" enterDelay={500}>
            <ListItemIcon><MoreIcon /></ListItemIcon>
          </Tooltip>
        </ListItemButton>)}
    </List>
  </Stack>
});

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

FlashcardSelection.displayName = "FlashcardSelection";
AddTags.displayName = "AddTags";

export default function EditDeck() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [name, setName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [isPublic, setIsPublic] = React.useState<boolean>(false);
  const [selectedFlashcards, setSelectedFlashcards] = React.useState<FlashcardInDeck[]>([]);
  const [flashcardsToAdd, setFlashcardsToAdd] = React.useState<number[]>([]);
  const [flashcardsToRemove, setFlashcardsToRemove] = React.useState<number[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagsToAdd, setTagsToAdd] = React.useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = React.useState<string[]>([]);
  const [deck, setDeck] = React.useState<Deck>();

  React.useEffect(() => {
    const onSuccess = async (response: Response) => {
      const result = await response.json();
      setDeck(result);
      setName(result.name);
      setDescription(result.description);
      setIsPublic(result.public);
      setTags(result.tags);
      setSelectedFlashcards(result.flashcards);
    }

    fetchAuthGET("decks/" + id, 200, onSuccess);
  }, []);

  const editDeck = async () => {
    const updatedDeck: DeckUpdateDTO = { name: name, description: description, public: isPublic, flashcards_to_add: flashcardsToAdd, flashcards_to_remove: flashcardsToRemove, tags_to_add: tagsToAdd, tags_to_remove: tagsToRemove };
    fetchAuthPUT("decks/" + id, 200, RequestBodyType.JSON, updatedDeck);
    router.push("/decks/" + id);
  }

  return (deck && <Paper sx={{ p: 3, mx: "auto" }}>
    <Typography variant="h4" mb={2}>
      Edit Deck
    </Typography>
    <Paper variant="outlined" sx={{ p: 2, minHeight: 600, display: "flex", flexDirection: "column" }}>
      <Grid container spacing={2}>
        <Grid size={6}>
          <Stack spacing={2}>
            <TextField
              variant="standard"
              label="Name"
              size="small"
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)} />
            <TextField
              multiline
              placeholder='Description'
              minRows={2}
              maxRows={10}
              fullWidth
              variant='standard'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ flexGrow: 1, maxHeight: 300 }}
            />
            <FormControlLabel control={<Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />} label="Public" />
            <AddTags tags={tags} setTags={setTags} tagsToAdd={tagsToAdd} setTagsToAdd={setTagsToAdd} tagsToRemove={tagsToRemove} setTagsToRemove={setTagsToRemove} />
          </Stack>
        </Grid>
        <Grid size={6}>
          <FlashcardSelection
            selectedFlashcards={selectedFlashcards}
            setSelectedFlashcards={setSelectedFlashcards}
            flashcardsToAdd={flashcardsToAdd}
            setFlashcardsToAdd={setFlashcardsToAdd}
            flashcardsToRemove={flashcardsToRemove}
            setFlashcardsToRemove={setFlashcardsToRemove} />
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="center" mt={3}>
        <Button variant='contained' onClick={editDeck}>EDIT</Button>
      </Box>
    </Paper>
  </ Paper>);
}