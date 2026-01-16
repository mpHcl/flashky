"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Typography
} from '@mui/material'
import Media from '../../components/media';
import { getFlashcard } from '../lib/fetch';
import { Flashcard } from '@/app/lib/types';
import { fetchAuthDELETE } from '@/app/lib/fetch';

export default function Flashky() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const [data, setData] = useState<Flashcard>();
  const [ownerId, setOwnerId] = useState<number>(-1);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClickPopper = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpen(true);
  };

  const deleteFlashcard = async () => {
    const onSuccess = async () => {
      router.push("flashky/my");
    }
    fetchAuthDELETE(`flashcards/${id}`, 200, onSuccess);
  }


  useEffect(() => {
    getFlashcard(id, setData, setOwnerId);
  }, []);

  return (
    data &&
    <Paper sx={{ p: 3, mx: "auto" }}>
      <Grid container spacing={2}>
        <Grid size={10}>
          <Typography variant="h3" gutterBottom>
            {data.name}
          </Typography>
        </Grid>
        <Grid size={2} display="flex" justifyContent="right" alignItems="right">
          {ownerId == data.owner_id && <ClickAwayListener onClickAway={(e) => setOpen(false)}>
            <Box>
              <Button onClick={handleClickPopper}>More actions</Button>
              <Popper open={open} anchorEl={anchorEl} placement="bottom-end">
                <Paper sx={{ minWidth: 180 }}>
                  <List>
                    <ListItemButton
                      component="a"
                      href={`/flashky/${id}/edit`}>
                      <ListItemText primary="Edit" />
                    </ListItemButton>
                    <ListItemButton
                      onClick={deleteFlashcard}>
                      <ListItemText primary="Delete" />
                    </ListItemButton>
                  </List>
                </Paper>
              </Popper>
            </Box></ClickAwayListener>}
        </Grid>
      </Grid>


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