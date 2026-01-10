"use client";
import { Chip, Grid, Paper, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { Deck } from "../../lib/types";
import { fetchAuthGET } from '@/app/lib/fetch';
import CrudList from '@/app/components/crudlist';
import Comments from '@/app/components/comments/Comments';

export default function ViewDeck() {
    const params = useParams();
    const id = params.id;
    const [deck, setDeck] = useState<Deck>();

    useEffect(() => {
        const onSuccess = async (response: Response) => {
            const result = await response.json();
            setDeck(result);
        }

        fetchAuthGET("decks/" + id, 200, onSuccess);
    }, []);

    return (deck && <>
    <Paper sx={{ p: 3, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
            {deck.name}
            <Chip label={deck.public ? "Public" : "Private"} variant='outlined' sx={{ mx: 1 }} />
        </Typography>
        {deck.tags.map((tag, index) =>
            <Chip key={index} label={tag} sx={{ m: 0.25 }} />
        )}
        <Paper variant='outlined' sx={{ maxHeight: 500, overflow: 'scroll' }}>
            <Typography variant="subtitle1" gutterBottom whiteSpace={'pre-wrap'} sx={{ p: 1 }}>
                {deck.description}
            </Typography>
        </Paper>
        <Typography variant='h6'>
            Flashcards:
        </Typography>
        <CrudList data={deck.flashcards.map((el) => ({ id: el.id, name: el.name, preview: '' }))} showUpdateDeleteBtns={false} path={'flashky'} />
    </Paper>
    <Paper sx={{p: 3, mx: "auto"}}>
        <Comments deck_id={deck.id}/>
    </Paper>
    </>);
}