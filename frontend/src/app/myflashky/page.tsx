"use client";
import { useEffect, useState, Suspense } from "react";
import Box from '@mui/material/Box';
import CrudList from "../components/crudlist";


export default function MyFlashky()
{
    const [data, setData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
        const myHeaders = new Headers();
        let token = localStorage.getItem("token")
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders
        };
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
        <Suspense fallback={<div>Loading...</div>}>
            <CrudList data={data.map((el) => ({id:el.id, name:el.name}))} showUpdateDeleteBtns={true} path="flashky"></CrudList>
        </Suspense>
        
    </Box>);
}