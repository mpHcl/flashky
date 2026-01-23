'use client';
import AddIcon from '@mui/icons-material/Add';
import { Suspense, useEffect, useState } from 'react';
import { Box, Button, Link, Typography } from '@mui/material';
import CrudList from '@/app/components/crudlist';
import { fetchAuthDELETE, fetchAuthGET } from '@/app/lib/fetch';
import SavedDecks from '../components/SavedDecks';
import { checkAuthenticated, useAuth } from '@/app/(auth)/context/AuthContext';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/app/components/dialogs/ConfirmDialog';

export default function MyDecks() {
  const [data, setData] = useState([]);
  const [idToDelete, setIdToDelete] = useState<number>(-1);
  // let idToDelete = -1;
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const {isAuthenticated} = useAuth();
  const router = useRouter();

  const deleteDeck = async (id: number) => {
    await setIdToDelete(id);
    setOpenDeleteDialog(true);
  }

  const confirmDelete = async () => {
    const onSuccess = async () => {
      setData(data.filter((d : { id: number })=> d.id != idToDelete));
    }
    fetchAuthDELETE(`decks/${idToDelete}`, 200, onSuccess);
    setOpenDeleteDialog(false);
  }

  useEffect(() => {
      if (!checkAuthenticated(router, isAuthenticated)) {
        return;
      }

      const onSuccess = async (response: Response) => {
        const result = await response.json();
        setData(result.decks);
      }

      fetchAuthGET("decks/mydecks", 200, onSuccess);  
  }, [isAuthenticated]);
  
  return (
    <>
      <ConfirmDialog
            open={openDeleteDialog}
            action="Are you sure you want to delete this deck?"
            onYes={() => { confirmDelete() }}
            onNo={() => setOpenDeleteDialog(false)}
          />
      <Box
        display="flex"
        gap={4}
        alignItems="flex-start"
      >
        {/* LEFT COLUMN */}
        <Box flex={1}>
          <Box display="flex" alignItems="center" height="100px">
            <Typography variant="h2" gutterBottom>
              My Decks
            </Typography>

            <Box ml="auto">
              <Link href="/decks/add">
                <Button
                  color="secondary"
                  size="large"
                  variant="outlined"
                  startIcon={<AddIcon />}
                >
                  Create a new deck
                </Button>
              </Link>
            </Box>
          </Box>


          <Box>
            <Suspense fallback={<div>Loading...</div>}>
              <CrudList
                data={data.map((el: {id: number,  name: string, description: string})=> ({
                  id: el.id,
                  name: el.name,
                  preview: el.description,
                }))}
                showUpdateDeleteBtns={true}
                showLearnBtn={true}
                path="decks"
                onDeleteAction={deleteDeck}
              />
            </Suspense>
          </Box>
        </Box>

        {/* RIGHT COLUMN */}
        <Box flex={1}>
          <Box height="100px">
            <Typography variant="h2" gutterBottom>
              Saved
            </Typography>
          </Box>

          <SavedDecks />
        </Box>
      </Box>
    </>
  );

}