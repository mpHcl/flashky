import { ParamValue } from "next/dist/server/request/params";
import { Dispatch, SetStateAction } from "react";
import { CardToLearnResult } from "../lib/types";
import { BASE_URL } from "@/app/constants";


export const initLearning = async (
    deck_id: ParamValue, setInitializing:
        Dispatch<SetStateAction<boolean>>
) => {
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
        const response = await fetch(
            `${BASE_URL}learn/${deck_id}/init`,
            requestOptions
        );

        if (response.status !== 200) {

        }
        setInitializing(false);

    }
    catch (error) {
        console.error(error);
    }
};


export const getNextCardToLearn = async (
    deck_id: ParamValue,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setCardToLearn: Dispatch<SetStateAction<CardToLearnResult | undefined>>,
    setNextDate: Dispatch<SetStateAction<Date | undefined>>,
) => {
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
        const response = await fetch(
            `${BASE_URL}learn/${deck_id}/next`,
            requestOptions
        );

        if (response.status === 200) {
            const result = await response.json();
            setCardToLearn(result);
            if (result === null) {
                getNextLearnDate(deck_id, setNextDate);
            }
        }
        setLoading(false);

    }
    catch (error) {
        console.error(error);
    }
};


export const getNextLearnDate = async (
    deck_id: ParamValue,
    setNextDate: Dispatch<SetStateAction<Date | undefined>>
) => {
    const myHeaders = new Headers();
    let token = localStorage.getItem("token");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
    };

    try {
        const response = await fetch(
            `${BASE_URL}learn/${deck_id}/next-date`,
            requestOptions
        );
        setNextDate(new Date(await response.json() + "Z"));
    }
    catch (error) {
        console.error(error);
    }
};


export const postReview = async (quality: number, flashcard_id: number) => {
    const myHeaders = new Headers();
    let token = localStorage.getItem("token");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const raw = JSON.stringify({
        "quality": quality
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${BASE_URL}learn/${flashcard_id}/review`,
            requestOptions
        );
        return response.status;
    }
    catch (error) {
        console.error(error);
    }
}