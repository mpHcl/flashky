"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { DeckPostDTO, Flashcard } from '@/app/lib/types';
import { RequestBodyType } from '@/app/lib/fetchOptions';
import { fetchAuthGET, fetchAuthPOST } from '@/app/lib/fetch';

type FlashcardSelectionProps = {
    selectedFlashcards: Flashcard[];
    setSelectedFlashcards: (list: Flashcard[]) => void;
}

type AddTagsProps = {
    tags: string[];
    setTags: (list: string[]) => void;
}

const FlashcardSelection = React.memo(({ selectedFlashcards, setSelectedFlashcards }: FlashcardSelectionProps) => {
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
        if (!selectedFlashcards.some(f => f.id === searchFlashcards[index].id)) {
            setSelectedFlashcards([...selectedFlashcards, searchFlashcards[index]]);
        }
    }

    const deleteSelectedFlashcard = (id: number) => {
        setSelectedFlashcards(selectedFlashcards.filter(f => f.id !== id));
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
                        <ListItemIcon><MoreIcon/></ListItemIcon>
                    </Tooltip>
                </ListItemButton>)}
        </List>
    </Stack>
});

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

FlashcardSelection.displayName = "FlashcardSelection";
AddTags.displayName = "AddTags";

export default function NewDeck() {
    const router = useRouter();
    const [name, setName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [isPublic, setIsPublic] = React.useState<boolean>(false);
    const [selectedFlashcards, setSelectedFlashcards] = React.useState<Flashcard[]>([]);
    const [tags, setTags] = React.useState<string[]>([]);

    const createDeck = async () => {
        const newDeck: DeckPostDTO = { name: name, description: description, isPublic: isPublic, flashcards_ids: selectedFlashcards.map(f => f.id), tags: tags };
        fetchAuthPOST("decks", 200, RequestBodyType.JSON, newDeck);
        router.push("/decks/my");
    }

    return (<Paper sx={{ p: 3, mx: "auto" }}>
        <Typography variant="h4" mb={2}>
            Create a new Deck
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
                        <AddTags tags={tags} setTags={setTags} />
                    </Stack>
                </Grid>
                <Grid size={6}>
                    <FlashcardSelection selectedFlashcards={selectedFlashcards} setSelectedFlashcards={setSelectedFlashcards} />
                </Grid>
            </Grid>
            <Box display="flex" justifyContent="center" mt={3}>
                <Button variant='contained' onClick={createDeck}>CREATE</Button>
            </Box>
        </Paper>
    </ Paper>);
}