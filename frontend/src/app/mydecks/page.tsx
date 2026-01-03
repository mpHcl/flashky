import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';

export default function MyDecks()
{
    return (<>
    <Typography variant="h2" gutterBottom>My Decks</Typography>
    <Link href="/mydecks/newdeck"><Button color="secondary" size="large" variant="outlined"><AddIcon /> Create a new deck</Button></Link>
    </>);
}