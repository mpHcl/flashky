"use client";
import { Box, Button, Chip, ClickAwayListener, Grid, List, ListItemButton, ListItemText, Paper, Popper, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Deck } from "../../lib/types";
import { fetchAuthDELETE, fetchAuthGET } from '@/app/lib/fetch';
import CrudList from '@/app/components/crudlist';
import Comments from '@/app/components/comments/Comments';
import ConfirmDialog from '@/app/components/dialogs/ConfirmDialog';

export default function ViewDeck() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [deck, setDeck] = useState<Deck>();
  const [isOwned, setIsOwned] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    const onSuccess = async (response: Response) => {
      const result = await response.json();
      setDeck(result);
    }

    fetchAuthGET("decks/" + id, 200, onSuccess);

    const onSuccessIsOwned = async (response: Response) => {
      const result = await response.json();
      setIsOwned(result);
    }
    fetchAuthGET(`decks/${id}/isowned`, 200, onSuccessIsOwned)
  }, []);

  const handleClickPopper = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpen(true);
  };

  const confirmDelete = async () => {
    const onSuccess = async () => {
      router.push("/decks/my");
    }
    fetchAuthDELETE(`decks/${id}`, 200, onSuccess);
  }

  const clickDeleteDeck = async () => {
    setOpenDeleteDialog(true);
  }

  return (deck && <>
    <ConfirmDialog
      open={openDeleteDialog}
      action="Are you sure you want to delete this deck?"
      onYes={() => { confirmDelete() }}
      onNo={() => setOpenDeleteDialog(false)}
    />
    <Paper sx={{ p: 3, mx: "auto" }}>
      <Grid container spacing={2}>
        <Grid size={10}>
          <Typography variant="h4" gutterBottom>
            {deck.name}
            <Chip label={deck.public ? "Public" : "Private"} variant='outlined' sx={{ mx: 1 }} />
          </Typography>
        </Grid>
        <Grid size={2} display="flex" justifyContent="right" alignItems="right">
          {isOwned && <ClickAwayListener onClickAway={(e) => setOpen(false)}>
            <Box>
              <Button onClick={handleClickPopper}>More actions</Button>
              <Popper open={open} anchorEl={anchorEl} placement="bottom-end">
                <Paper sx={{ minWidth: 180 }}>
                  <List>
                    <ListItemButton
                      component="a"
                      href={`/flashky/add?deck=${id}`}>
                      <ListItemText primary="Add new flashcards" />
                    </ListItemButton>
                    <ListItemButton
                      component="a"
                      href={`/decks/${id}/edit`}>
                      <ListItemText primary="Edit" />
                    </ListItemButton>
                    <ListItemButton
                      onClick={clickDeleteDeck}>
                      <ListItemText primary="Delete" />
                    </ListItemButton>
                  </List>
                </Paper>
              </Popper>
            </Box></ClickAwayListener>}
        </Grid>
      </Grid>

      {deck.tags.map((tag, index) =>
        <Chip key={index} label={tag} sx={{ m: 0.25 }} />
      )}
      <Paper variant='outlined' sx={{ maxHeight: 500, overflow: 'auto' }}>
        <Typography variant="subtitle1" gutterBottom whiteSpace={'pre-wrap'} sx={{ p: 1 }}>
          {deck.description}
        </Typography>
      </Paper>
      <Typography variant='h6'>
        Flashcards:
      </Typography>
      <CrudList data={deck.flashcards.map((el) => ({ id: el.id, name: el.name, preview: '' }))} showUpdateDeleteBtns={false} path={'flashky'} />
    </Paper>
    <Paper sx={{ p: 3, mx: "auto" }}>
      <Comments deck_id={deck.id} />
    </Paper>
  </>);
}