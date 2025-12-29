'use client'

import {
  Box,
  Card,
  CardMedia,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';

import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";

import { useEffect, useState } from 'react';
import { Dispatch, SetStateAction } from "react";
import { BASE_URL } from '../constants';


type MediaInfo = {
  id: number;
  type: string;
  autoplay: boolean;
}

type MediaProps = {
  flashcard_side_id: number
}

const getMediaInfos = async (
  flashcard_side_id: number,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setMediaInfos: Dispatch<SetStateAction<MediaInfo[] | undefined>>
) => {
  const myHeaders = new Headers();
  const token = localStorage.getItem("token");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  try {
    if (flashcard_side_id != 0) {
      const response = await fetch(
        `${BASE_URL}media/side/${flashcard_side_id}`,
        requestOptions
      );
      if (response.status === 200) {
        const result = await response.json();
        setMediaInfos(result);
      }
      setLoading(false);
    }

  }
  catch (error) {
    console.error(error);
  }
};

export default function Media({ flashcard_side_id }: MediaProps) {
  const [loading, setLoading] = useState(true);
  const [mediaInfos, setMediaInfos] = useState<MediaInfo[]>()

  useEffect(() => {
    getMediaInfos(flashcard_side_id, setLoading, setMediaInfos);
  }, [flashcard_side_id]);


  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon />;
      case "video":
        return <VideocamIcon />;
      case "audio":
        return <AudiotrackIcon />;
      default:
        return null;
    }
  };

  const renderMedia = (media: MediaInfo, src: string, numOfElements: number) => {
    switch (media.type) {
      case "image":
        return (
          <CardMedia
            component="img"
            image={src}
            alt={`media-${media.id}`}
            sx={{ height: numOfElements !== 1 ? 240 : 400, objectFit: "contain" }}
          />
        );

      case "video":
        return (
          <CardMedia
            component="video"
            src={src}
            controls
            sx={{ height: numOfElements !== 1 ? 240 : 400 }}
            autoPlay={media.autoplay}
          />
        );

      case "audio":
        return (
          <Box sx={{ p: 2 }}>
            <CardMedia component="audio" src={src} controls autoPlay={media.autoplay} />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {loading ?
        <>Loading</> :
        <Grid container spacing={2}>
          {mediaInfos?.map((media) => {
            const src = `${BASE_URL}media/file/${media.id}`;

            return (
              <Grid key={media.id} size={12}>
                <Card
                  elevation={2}
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                  }}
                >
                  {/* Media */}
                  {renderMedia(media, src, mediaInfos.length)}

                  {/* Icon overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    <Tooltip title={media.type}>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.8)",
                          },
                        }}
                      >
                        {getIcon(media.type)}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      }
    </>
  )
}