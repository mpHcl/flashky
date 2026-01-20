"use client";
import { useEffect, useState } from "react";

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { BASE_URL } from "./constants";
import { useAuth } from "./(auth)/context/AuthContext";
import { Card, CardActionArea, CardContent, Grid } from "@mui/material";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(isAuthenticated === null);
  }, [isAuthenticated])

  return (
    !loading &&
    <div>
      <Typography variant="h2" gutterBottom>Welcome to FLASHKY!</Typography>
      {
        isAuthenticated ?
          <>
            <Grid container rowSpacing={8} columnSpacing={8} sx={{m: '10px', p: '10px'}}>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px', bgcolor: 'secondary.dark' }}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        Item 1
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px' }}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        Item 2
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px' }}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        Item 3
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px' }}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        Item 4
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
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
