'use client';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { Suspense, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import CrudList from '../components/crudlist';
import { fetchAuthGET } from '../lib/fetch';

export default function MyDecks() {
    const [data, setData] = useState([]);
    useEffect(() => {
        const onSuccess = async (response: Response) => {
            const result = await response.json();
            setData(result.decks);
        }

        fetchAuthGET("decks/mydecks", 200, onSuccess);
    }, []);
    return (<>
        <Typography variant="h2" gutterBottom>My Decks</Typography>
        <Link href="/mydecks/newdeck"><Button color="secondary" size="large" variant="outlined"><AddIcon /> Create a new deck</Button></Link>
        <Box>
            <Suspense fallback={<div>Loading...</div>}>
                <CrudList data={data.map((el) => ({ id: el.id, name: el.name, preview: el.description }))} showUpdateDeleteBtns={true} path="deck"></CrudList>
            </Suspense>

        </Box>
    </>);
}