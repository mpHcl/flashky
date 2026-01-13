"use client";
import { useEffect, useState, Suspense } from "react";
import Box from '@mui/material/Box';
import CrudList from "../../components/crudlist";
import { BASE_URL } from "../../constants";
import { Button, Link, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';


export default function MyFlashky() {
    const [data, setData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const myHeaders = new Headers();
            const token = localStorage.getItem("token")
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders
            };
            try {
                const result = await fetch(BASE_URL + "flashcards/myflashcards", requestOptions);
                const jsonResult = await result.json();
                setData(jsonResult.flashcards);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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