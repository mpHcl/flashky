'use client';
import AddIcon from '@mui/icons-material/Add';
import { Suspense, useEffect, useState } from 'react';
import { Box, Button, Link, Typography } from '@mui/material';
import CrudList from '../components/crudlist';
import { fetchAuthGET } from '../lib/fetch';
import SavedDecks from '../decks/components/SavedDecks';

export default function MyDecks() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const onSuccess = async (response: Response) => {
      const result = await response.json();
      setData(result.decks);
    }

    fetchAuthGET("decks/mydecks", 200, onSuccess);
  }, []);
  return (
    <>
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
              <Link href="/mydecks/add">
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
                data={data.map(el => ({
                  id: el.id,
                  name: el.name,
                  preview: el.description,
                }))}
                showUpdateDeleteBtns
                path="decks"
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