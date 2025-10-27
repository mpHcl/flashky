"use client";
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import DrawIcon from '@mui/icons-material/Draw';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';

export default function Register() {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper elevation={1} sx={{ minWidth: 400, maxWidth: 600 }}>
        <Stack spacing={2} justifyContent="center" alignItems="center" p={2} sx={{ margin: 2 }}>
          <Typography variant="h4" gutterBottom>Welcome to Flashky!</Typography>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" required>
            <InputLabel htmlFor="register-username-input">Username</InputLabel>
            <OutlinedInput
              id="register-username-input"
              endAdornment={
                <InputAdornment position="end">
                  <PersonIcon />
                </InputAdornment>
              }
              label="Username"
            />
          </FormControl>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" required>
            <InputLabel htmlFor="register-email-input">E-mail</InputLabel>
            <OutlinedInput
              id="register-email-input"
              endAdornment={
                <InputAdornment position="end">
                  <AlternateEmailIcon />
                </InputAdornment>
              }
              label="E-mail"
            />
          </FormControl>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" required>
            <InputLabel htmlFor="register-password-input">Password</InputLabel>
            <OutlinedInput
              id="register-password-input"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? 'hide the password' : 'display the password'
                    }
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="register-description-input">Description</InputLabel>
            <OutlinedInput
              id="register-description-input"
              endAdornment={
                <InputAdornment position="end">
                  <DrawIcon />
                </InputAdornment>
              }
              label="Description"
              multiline={true}
            />
            <FormHelperText>Tell us a little about yourself</FormHelperText>
          </FormControl>
          <Button color="secondary" size="large" variant="contained">Register</Button>
          <Typography variant="caption" gutterBottom>Already have an account? <Link href="/login">Log in!</Link></Typography>
        </Stack>
      </Paper>
    </Box>
  );
}