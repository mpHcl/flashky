import { RequestBodyType } from "@/app/lib/fetchOptions";
import { fetchAuthGET, fetchAuthPOST, OK } from "@/app/lib/fetch";
import { Dispatch, SetStateAction } from "react";
import { Flashcard } from "@/app/lib/types";

export const getFlashcard = async (id: number, setData: Dispatch<SetStateAction<Flashcard | undefined>>) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setData(result);
    }
    fetchAuthGET(`flashcards/${id}`, OK, onSuccess);
}

export const uploadMedia = async (sideId: number, file: File) => {
    const formdata = new FormData();
    formdata.append("file", file);

    fetchAuthPOST(`media/${sideId}`, OK, RequestBodyType.FORM_DATA, formdata);
}

export const createFlashcard = async (
    name: string,
    frontText: string,
    backText: string,
    frontMediaFiles: File[],
    backMediaFiles: File[],
) => {
    const content = {
        "name": name,
        "front": {
            "content": frontText
        },
        "back": {
            "content": backText
        }, 
        "tags": [] // TODO 
    };

    const onSuccess = async (response: Response) => {
        const result = await response.json();

        await Promise.all(frontMediaFiles.map(file => uploadMedia(result.front_side.id, file)));
        await Promise.all(backMediaFiles.map(file => uploadMedia(result.back_side.id, file)));
    }

    fetchAuthPOST("flashcards", OK, RequestBodyType.JSON, content, onSuccess)
}