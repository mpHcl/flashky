"use client";
import { useEffect, useState } from "react";

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { BASE_URL } from "./constants";
import { useAuth } from "./(auth)/context/AuthContext";

export default function Home() {
  const {isAuthenticated} = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(isAuthenticated === null);
  }, [isAuthenticated])

  return (
    !loading && 
    <div>
      <Typography variant="h2" gutterBottom>Welcome to FLASHKY!</Typography>
      {
        isAuthenticated ?
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
