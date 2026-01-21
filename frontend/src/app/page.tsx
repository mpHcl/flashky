"use client";
import { useEffect, useState } from "react";

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { BASE_URL } from "./constants";
import { useAuth } from "./(auth)/context/AuthContext";
import { Card, CardActionArea, CardContent, Grid } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExploreIcon from '@mui/icons-material/Explore';
import LoginIcon from '@mui/icons-material/Login';
import NoteIcon from '@mui/icons-material/Note';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StyleIcon from '@mui/icons-material/Style';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(isAuthenticated === null);
  }, [isAuthenticated])

  return (
    !loading &&
    <div>
      {
        isAuthenticated ?
          <>
            <Grid container rowSpacing={8} columnSpacing={8} sx={{display: 'flex', mx: '20px', px: '20px'}}>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px', bgcolor: 'primary.dark' }}>
                  <CardActionArea href="/search" sx={{ display: 'flex', height: '35dvh'  }}>
                    <CardContent>
                      <Typography gutterBottom variant="h2" component="div" sx={{textAlign: 'center'}}>
                        EXPLORE <ExploreIcon fontSize="inherit"/>
                      </Typography>
                      <Typography gutterBottom variant="h5" component="div" sx={{textAlign: 'center'}}>
                        Look for new things to learn
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px', bgcolor: 'warning.dark' }}>
                  <CardActionArea href="/decks/my" sx={{ display: 'flex', height: '35dvh'  }}>
                    <CardContent>
                      <Typography gutterBottom variant="h2" component="div" sx={{textAlign: 'center'}}>
                        MY DECKS <StyleIcon fontSize="inherit"/>
                      </Typography>
                      <Typography gutterBottom variant="h5" component="div" sx={{textAlign: 'center'}}>
                        View and manage your decks
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px', bgcolor: 'secondary.dark' }}>
                  <CardActionArea href="/flashky/my" sx={{ display: 'flex', height: '35dvh'  }}>
                    <CardContent>
                      <Typography gutterBottom variant="h2" component="div" sx={{textAlign: 'center'}}>
                        MY FLASHKY <NoteIcon fontSize="inherit"/>
                      </Typography>
                      <Typography gutterBottom variant="h5" component="div" sx={{textAlign: 'center'}}>
                        Find specific cards
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px', bgcolor: 'info.dark' }}>
                  <CardActionArea href="/profile" sx={{ display: 'flex', height: '35dvh'  }}>
                    <CardContent>
                      <Typography gutterBottom variant="h2" component="div" sx={{textAlign: 'center'}}>
                        PROFILE <AccountCircleIcon fontSize="inherit"/>
                      </Typography>
                      <Typography gutterBottom variant="h5" component="div" sx={{textAlign: 'center'}}>
                        Express yourself
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </>
          :
          <>
            <Typography variant="h2" gutterBottom sx={{textAlign: 'center'}}>Welcome to FLASHKY!</Typography>
            <Grid container rowSpacing={8} columnSpacing={8} sx={{display: 'flex', m: '20px', p: '20px'}}>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px', bgcolor: 'primary.dark' }}>
                  <CardActionArea href="/login" sx={{ display: 'flex', height: '35dvh'  }}>
                    <CardContent>
                      <Typography gutterBottom variant="h2" component="div" sx={{textAlign: 'center'}}>
                        LOG IN <LoginIcon fontSize="inherit"/>
                      </Typography>
                      <Typography gutterBottom variant="h5" component="div" sx={{textAlign: 'center'}}>
                        Welcome back!
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ borderRadius: '30px', bgcolor: 'secondary.dark' }}>
                  <CardActionArea href="/register" sx={{ display: 'flex', height: '35dvh'  }}>
                    <CardContent>
                      <Typography gutterBottom variant="h2" component="div" sx={{textAlign: 'center'}}>
                        REGISTER <PersonAddIcon fontSize="inherit"/>
                      </Typography>
                      <Typography gutterBottom variant="h5" component="div" sx={{textAlign: 'center'}}>
                        Join the Flashky community
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </>
      }

    </div>
  );
}
