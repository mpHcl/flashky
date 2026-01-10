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
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { useRouter } from "next/navigation";
import { loginFetch } from '../lib/fetch';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();


  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const router = useRouter();

  const onLoginButtonClick = async () => {
    loginFetch(username, password, router, login);
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper elevation={1} sx={{ minWidth: 400, maxWidth: 600 }}>
        <Stack spacing={2} justifyContent="center" alignItems="center" p={2} sx={{ margin: 2 }}>
          <Typography variant="h4" gutterBottom>Welcome back!</Typography>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" required>
            <InputLabel htmlFor="login-username-input">Username</InputLabel>
            <OutlinedInput
              id="login-username-input"
              onChange={(e) => setUsername(e.target.value)}

              endAdornment={
                <InputAdornment position="end">
                  <PersonIcon />
                </InputAdornment>
              }
              label="Username"
            />
          </FormControl>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" required>
            <InputLabel htmlFor="login-password-input">Password</InputLabel>
            <OutlinedInput
              id="login-password-input"
              type={showPassword ? 'text' : 'password'}
              onChange={(e) => setPassword(e.target.value)}
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
          <Button color="secondary" size="large" variant="contained" onClick={onLoginButtonClick}>Log In</Button>
          <Typography variant="caption" gutterBottom>New here? <Link href="/register">Register!</Link></Typography>
        </Stack>
      </Paper>
    </Box>
  );
}