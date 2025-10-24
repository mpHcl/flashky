import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';

export default function Home() {
  return (
    <div>
      <Typography variant="h2" gutterBottom>Welcome to FLASHKY!</Typography>
      <Link href="/login"><Button color="secondary" size="large" variant="outlined">Log In</Button></Link>
      <Link href="/register"><Button color="secondary" size="large" variant="outlined">Register</Button></Link>
    </div>
  );
}
