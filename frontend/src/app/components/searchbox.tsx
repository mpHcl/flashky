import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBox() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <TextField placeholder="Find decks and flashky" fullWidth size="small" variant="outlined" color="primary" sx={{
      '& .MuiOutlinedInput-root': {backgroundColor: 'primary.main'}}} slotProps={{
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