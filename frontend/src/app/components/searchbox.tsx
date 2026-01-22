'use client';

import { Box, TextField, InputAdornment} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../(auth)/context/AuthContext';


export default function SearchBox() {
  const router = useRouter();
  const [queryString, setQueryString] = useState("");
  const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      setLoading(isAuthenticated === null);
    }, [isAuthenticated])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && queryString.trim()) {
      router.push(`/search?q=${encodeURIComponent(queryString)}`);
    }
  }

  return (!loading && isAuthenticated &&
    <Box display="flex" justifyContent="center" alignItems="center">
      <TextField 
        placeholder="Find decks" 
        fullWidth size="small" 
        variant="outlined" 
        color="primary" 
        value={queryString}
        onChange={(e) => setQueryString(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'primary.main'
          },
        }} 
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}/>
    </Box>
  );
}