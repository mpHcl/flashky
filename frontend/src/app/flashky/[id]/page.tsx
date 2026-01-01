"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography
} from '@mui/material'
import Media from '../../components/media';
import { getFlashcard } from '../lib/fetch';
import { Flashcard } from '../lib/types';

export default function Flashky() {
  const params = useParams();
  const id = Number(params.id);
  const [data, setData] = useState<Flashcard>();

  useEffect(() => {
    getFlashcard(id, setData);
  }, []);

  return (
    data &&
    <Paper sx={{ p: 3, mx: "auto" }}>
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
    </Paper>
  );
}