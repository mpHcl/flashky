"use client";
import { useEffect, useState, Suspense } from "react";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

type ListElement = {
    id: number,
    name: string
}

export default function MyFlashky()
{
    let elements: ListElement[] = [];
    let listItems: ListItemButton = [];
    const [data, setData] = useState([]);
    const myHeaders = new Headers();
    let token = localStorage.getItem("token")
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders
    };
    useEffect(() => {
        const fetchData = async () => {
        try {
            const result = await fetch("http://127.0.0.1:8000/flashcards/myflashcards", requestOptions);
            const jsonResult = await result.json();
            setData(jsonResult);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, []);

    return (<Box>
        <Suspense fallback={<div>Loading...</div>}></Suspense>
        <List>
            {data.map((el) => <ListItemButton key={el.id}>
                <ListItemText>{el.name}</ListItemText>
            </ListItemButton>)}
        </List>
    </Box>);
}