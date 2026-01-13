"use client";
import { useEffect, useState, Suspense } from "react";
import Box from '@mui/material/Box';
import CrudList from "../../components/CrudList";
import { Button, Link, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { fetchAuthGET, OK } from "@/app/lib/fetch";
import { checkAuthenticated, useAuth } from "@/app/(auth)/context/AuthContext";
import { useRouter } from "next/navigation";


export default function MyFlashky() {
    const [data, setData] = useState([]);
    const {isAuthenticated} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!checkAuthenticated(router, isAuthenticated)) {
          return;
        }

        const onSuccess = async (response: Response) => {
          const result = await response.json();
          setData(result.flashcards);
        }
        fetchAuthGET("flashcards/myflashcards", OK, onSuccess);
    }, [isAuthenticated]);

    return (<Box>
        <Typography variant="h2" gutterBottom>
              My Flashcards
            </Typography>
        <Box ml="auto">
              <Link href="/flashky/add">
                <Button
                  color="secondary"
                  size="large"
                  variant="outlined"
                  startIcon={<AddIcon />}
                >
                  Create a new flashcard
                </Button>
              </Link>
            </Box>
        <Suspense fallback={<div>Loading...</div>}>
            <CrudList data={data.map((el) => ({ id: el.id, name: el.name, preview: el.front_side.content == null ? "" : el.front_side.content }))} showUpdateDeleteBtns={true} path="flashky"></CrudList>
        </Suspense>
    </Box>);
}