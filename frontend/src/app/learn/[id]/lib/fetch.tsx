import { ParamValue } from "next/dist/server/request/params";
import { Dispatch, SetStateAction } from "react";
import { CardToLearnResult } from "../lib/types";
import { RequestBodyType } from "@/app/lib/fetchOptions";
import { fetchAuthGET, fetchAuthPOST, OK } from "@/app/lib/fetch";

export const initLearning = async (
    deck_id: ParamValue,
    setInitializing: Dispatch<SetStateAction<boolean>>
) => {
    setInitializing(true);
    fetchAuthPOST(`learn/${deck_id}/init`, OK, RequestBodyType.EMPTY);
    setInitializing(false);
};


export const getNextCardToLearn = async (
    deck_id: ParamValue,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setCardToLearn: Dispatch<SetStateAction<CardToLearnResult | undefined>>,
    setNextDate: Dispatch<SetStateAction<Date | undefined>>,
) => {
    setLoading(true);

    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setCardToLearn(result);
        if (result === null) {
            getNextLearnDate(deck_id, setNextDate);
        }
    }

    fetchAuthGET(`learn/${deck_id}/next`, OK, onSuccess);
    setLoading(false);
};


export const getNextLearnDate = async (
    deck_id: ParamValue,
    setNextDate: Dispatch<SetStateAction<Date | undefined>>
) => {
    const onSuccess = async (response: Response) => {
        setNextDate(new Date(await response.json() + "Z"));
    }
    fetchAuthGET(`learn/${deck_id}/next-date`, OK, onSuccess);
};


export const postReview = async (quality: number, flashcard_id: number) => {
    const body = {
        "quality": quality
    }
    return await fetchAuthPOST(`learn/${flashcard_id}/review`, OK, RequestBodyType.JSON, body);
}