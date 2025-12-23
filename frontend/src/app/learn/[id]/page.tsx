'use client'

import { Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react';


type CardSide = {
  id: number;
  content: string;
}

type CardToLearnResult = {
  id: number;
  last_review_date: Date | undefined;
  next_review_date: Date;
  efactor: number;
  front_side: CardSide;
  back_side: CardSide;
}


export default function Learn() {
  const params = useParams();
  const deck_id = params.id;

  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFront, setIsFront] = useState(true);


  const [cardToLearn, setCardToLearn] = useState<CardToLearnResult>();

  const initLearning = async () => {
    setInitializing(true);
    const myHeaders = new Headers();
    let token = localStorage.getItem("token");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/learn/${deck_id}/init`, requestOptions);
      if (response.status !== 200) {

      }
      setInitializing(false);

    }
    catch (error) {
      console.error(error);
    }
  };

  const getNextCardToLearn = async () => {
    setLoading(true);
    const myHeaders = new Headers();
    let token = localStorage.getItem("token");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/learn/${deck_id}/next`, requestOptions);
      if (response.status === 200) {
        const result = await response.json();
        console.log(result);
        setCardToLearn(result);
        console.log(cardToLearn)
      }
      setLoading(false);

    }
    catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initLearning();
    getNextCardToLearn();
  }, [])

  return (<>{initializing ? <div>Initializing learning module</div> : cardToLearn && <>{
    <Box
      sx={{
        border: "1px solid #ccc",
        padding: 2,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <Stack direction="row" spacing={2}>
        {/* LEFT: INFO RECTANGLE */}
        <Card sx={{ width: 250 }}>
          <CardContent>
            <Typography variant="h6">Review Info</Typography>
            <Divider sx={{ my: 1 }} />

            <Typography variant="body2">
              <strong>Last review:</strong>{" "}
              {cardToLearn.last_review_date
                ? new Date(cardToLearn.last_review_date).toLocaleTimeString()
                : "—"}
            </Typography>

            <Typography variant="body2">
              <strong>Next review:</strong>{" "}
              { new Date(cardToLearn.next_review_date).toLocaleTimeString()}
            </Typography>

            <Typography variant="body2">
              <strong>E-Factor:</strong> {cardToLearn.efactor.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>

        {/* RIGHT: FLASHCARD */}
        <Card
          sx={{
            flex: 1,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 220,
          }}
          onClick={() => setIsFront((prev) => !prev)}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              {isFront ? cardToLearn.front_side.content : cardToLearn.back_side.content}
            </Typography>

            <Box
              sx={{
                mt: 2,
                height: 80,
                border: "1px dashed #aaa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              Media placeholder for side id: <Media flashcard_side_id={isFront ? cardToLearn.front_side.id : cardToLearn.back_side.id}/>
            </Box>

            <Typography
              variant="caption"
              display="block"
              sx={{ mt: 1, color: "text.secondary" }}
            >
              (click to flip)
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* BOTTOM BUTTONS */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mt: 2 }}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <Button key={value} variant="outlined">
            +{value}
          </Button>
        ))}
      </Stack>
    </Box>
  }</>
}</>);
}

type MediaProps = {
  flashcard_side_id: number
}
function Media({flashcard_side_id} : MediaProps) {
  useEffect(() => {

  }, []);


  return <>{flashcard_side_id} <img src="http://127.0.0.1:8000/media/file/17"/></>
}