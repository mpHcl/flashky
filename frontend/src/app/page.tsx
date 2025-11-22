"use client";
import { useEffect, useState } from "react";

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';

export default function Home() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setHasToken(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/check_token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          localStorage.removeItem("token");
          setHasToken(false);
        } else {
          setHasToken(true);
        }
      } catch (error) {
        console.error('Token check failed:', error);
        localStorage.removeItem("token");
        setHasToken(false);
      }
    };
    
    checkToken();
  }, []);

  return (
    <div>
      <Typography variant="h2" gutterBottom>Welcome to FLASHKY!</Typography>
      {
        hasToken ?
          <>
            <Link href="/logout"><Button color="secondary" size="large" variant="outlined">Log out</Button></Link>
          </>
          :
          <>
            <Link href="/login"><Button color="secondary" size="large" variant="outlined">Log In</Button></Link>
            <Link href="/register"><Button color="secondary" size="large" variant="outlined">Register</Button></Link>
          </>
      }

    </div>
  );
}
