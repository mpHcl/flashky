"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    Grid,
    InputAdornment,
    InputLabel,
    List,
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import { BASE_URL } from '@/app/constants';

const FlashcardSelection = React.memo(() => {
    const [queryString, setQueryString] = React.useState("");
    const [searchFlashcards, setSearchFlashcards] = React.useState([]);
    const [selectedFlashcards, setSelectedFlashcards] = React.useState([]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && queryString.trim()) {
            const fetchData = async () => {
                const myHeaders = new Headers();
                const token = localStorage.getItem("token")
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${token}`);

                const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                };

                try {
                    const response = await fetch(BASE_URL + "flashcards/myflashcards?q=" + queryString, requestOptions);
                    const result = await response.json();
                    setSearchFlashcards(result.flashcards);
                }
                catch (error) {
                    console.error(error);
                }
            }
            fetchData();
        }
    }

    const handleSelectFlashcard = (index: number) => {
        setSelectedFlashcards([...selectedFlashcards, searchFlashcards[index]]);
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
        <Chip key={index} label={el.name} sx={{ m: 0.25 }} onDelete={(e) => deleteSelectedFlashcard(el.id)}/>)}
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
                </ListItemButton>)}
        </List>
    </Stack>
});

const AddTags = React.memo(() => {
    const [newTag, setNewTag] = React.useState("");
    const [tags, setTags] = React.useState<string[]>([]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && newTag.trim()) {
            setTags([...tags, newTag]);
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
        <Chip key={index} label={tag} sx={{ m: 0.25 }} onDelete={(e) => deleteTag(tag)}/>)}
        </Box>
        </>
})

FlashcardSelection.displayName = "FlashcardSelection";
AddTags.displayName = "AddTags";

export default function NewDeck() {
    const [name, setName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [isPublic, setIsPublic] = React.useState<boolean>(false);

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
                        <AddTags />
                    </Stack>
                </Grid>
                <Grid size={6}>
                    <FlashcardSelection />
                </Grid>
            </Grid>
        <Box display="flex" justifyContent="center" mt={3}>
                <Button variant='contained' >CREATE</Button>
              </Box>
        </Paper>
    </ Paper>);
}