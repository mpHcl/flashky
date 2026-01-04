"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import {
    Grid,
    Paper,
    Typography
} from '@mui/material'
import Media from '../../components/media';
import { BASE_URL } from '@/app/constants';
import { Flashcard } from '@/app/lib/types';

export default function Flashky() {
    const params = useParams();
    const id = params.id;
    const [data, setData] = useState<Flashcard>({ id: 0, name: '', owner_id: 0, creation_date: Date(), front_side: { id: 0, content: '', media: [] }, back_side: { id: 0, content: '', media: [] } });
    useEffect(() => {
        const fetchData = async () => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: "GET",
                headers: myHeaders
            };
            try {
                const result = await fetch(BASE_URL + "flashcards/" + id, requestOptions);
                const jsonResult = await result.json();
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
                    <Media flashcard_side_id={data.front_side.id} />
                </Paper>
                <Typography variant="caption">front</Typography>
            </Grid>

            { /* Back */}
            <Grid size={4}>
                <Paper variant="outlined" sx={{ p: 2, height: 600, display: "flex", flexDirection: "column" }}>
                    <Typography variant="body1" gutterBottom>
                        {data.back_side.content}
                    </Typography>
                    <Media flashcard_side_id={data.back_side.id} />
                </Paper>
                <Typography variant="caption">back</Typography>
            </Grid>
        </Grid>
    </Paper>);
}