"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from "react";
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

type FlashcardSide = {
    id: number,
    content: string
    media_id: number[]
}

type Flashcard = {
    id: number,
    name: string,
    owner_id: number,
    creation_date: string,
    front_side: FlashcardSide,
    back_side: FlashcardSide
}

export default function Flashky()
{
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    // let flashcard: Flashcard;
    // const [data, setData] = useState<Flashcard>({});
    const [data, setData] = useState<Flashcard>({id:0, name:'', owner_id:0, creation_date:Date(), front_side:{id:0, content:'', media_id:[]}, back_side:{id:0, content:'', media_id:[]}});
    useEffect(() => {
        const fetchData = async () => {
        const myHeaders = new Headers();
        // const token = localStorage.getItem("token")
        myHeaders.append("Content-Type", "application/json");
        // myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders
        };
        try {
            const result = await fetch("http://127.0.0.1:8000/flashcards/" + id, requestOptions);
            // console.log(result);
            const jsonResult = await result.json();
            // console.log(jsonResult);
            // const flashcard: Flashcard = {id: jsonResult.id, name: jsonResult.name, owner_id: jsonResult.owner_id, creation_date: jsonResult.creation_date, front_side: {id: jsonResult.front_side.id, content: jsonResult.front_side.content}, back_side: {id: jsonResult.back_side.id, content: jsonResult.back_side.content}};
            // console.log(flashcard);
            setData(jsonResult);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, []);
    return (<Paper sx={{ p: 3, mx: "auto" }}>
        <Typography variant="h3" gutterBottom>
            {data.name}
        </Typography>
        <Grid container spacing={2}>

            { /* Front */}
            <Grid size={4}>
                <Paper variant="outlined" sx={{ p: 2, height: 600, display: "flex", flexDirection: "column" }}>
                    <Typography variant="body1" gutterBottom>
                        {data.front_side.content}
                    </Typography>
                </Paper>
                <Typography variant="caption">front</Typography>
            </Grid>

            { /* Back */}
            <Grid size={4}>
            <Paper variant="outlined" sx={{ p: 2, height: 600, display: "flex", flexDirection: "column" }}>
                    <Typography variant="body1" gutterBottom>
                        {data.back_side.content}
                    </Typography>
                </Paper>
                <Typography variant="caption">back</Typography>
            </Grid>
        </Grid>
    </Paper>);
}