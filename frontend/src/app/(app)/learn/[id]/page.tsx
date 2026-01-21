'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography
} from '@mui/material';

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

import Media from '@/app/components/media';

import { getNextCardToLearn, initLearning, postReview } from '../lib/fetch';
import { CardToLearnResult } from '../lib/types';
import { checkAuthenticated, useAuth } from '@/app/(auth)/context/AuthContext';

export default function Learn() {
  const params = useParams();
  const deck_id = params.id;

  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFront, setIsFront] = useState(true);


  const [cardToLearn, setCardToLearn] = useState<CardToLearnResult>();
  const [nextDate, setNextDate] = useState<Date>();

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


  useEffect(() => {
    if (!checkAuthenticated(router, isAuthenticated)) {
      return;
    }
    initLearning(deck_id, setInitializing)
      .then(() => delay(100))
      .then(
        () => {
          getNextCardToLearn(deck_id, setLoading, setCardToLearn, setNextDate)
        }
      );
  }, [isAuthenticated])

  return (
    <>{initializing || loading ?
      <div>Initializing learning module</div> : cardToLearn ?
        <Box
          sx={{
            padding: 3,
            width: "100%",
            margin: "0 auto",
            minHeight: "75vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="stretch"
            sx={{ flex: 1 }}
          >
            {/* INFO RECTANGLE */}
            <Card
              sx={{
                width: 260,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent>
                <Typography variant="h6">Review Info</Typography>
                <Divider sx={{ my: 1 }} />

                <Typography variant="body2">
                  <strong>Last review:</strong>{" "}
                  {cardToLearn.last_review_date
                    ? new Date(cardToLearn.last_review_date + "Z").toLocaleTimeString()
                    : "—"}
                </Typography>

                <Typography variant="body2">
                  <strong>Next review:</strong>{" "}
                  {new Date(cardToLearn.next_review_date + "Z").toLocaleTimeString()}
                </Typography>

                <Typography variant="body2">
                  <strong>E-Factor:</strong> {cardToLearn.efactor.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            {/* FLASHCARD */}
            <Card
              sx={{
                flex: 1,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                minHeight: 400,
              }}
              onClick={() => setIsFront((prev) => !prev)}
            >
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h5" gutterBottom align="center">
                  {isFront
                    ? cardToLearn.front_side.content
                    : cardToLearn.back_side.content}
                </Typography>

                {/* MEDIA CONTAINER */}
                <Media
                  flashcard_side_id={
                    isFront
                      ? cardToLearn.front_side.id
                      : cardToLearn.back_side.id
                  }
                />

                <Typography
                  variant="caption"
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
            sx={{ mt: 3 }}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <Button key={value} variant="outlined" onClick={async (_) => {
                if (await postReview(value, cardToLearn.id) === 200) {
                  setIsFront(true);
                  getNextCardToLearn(deck_id, setLoading, setCardToLearn, setNextDate);
                }
              }}>
                +{value}
              </Button>
            ))}
          </Stack>
        </Box> :
        <>No cards to learn, next planned review is {nextDate?.toLocaleString()}</>
    }
    </>
  );
}

