import { RequestBodyType } from "@/app/lib/fetchOptions";
import { fetchAuthGET, fetchAuthPOST, fetchAuthPUT, OK } from "@/app/lib/fetch";
import { Dispatch, SetStateAction } from "react";
import { Deck, DeckUpdateDTO, Flashcard } from "@/app/lib/types";

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

const addToDeck = async (id: number, deck: Deck) => {
    const editedDeck : DeckUpdateDTO = {name: deck.name, description: deck.description, public: deck.public, flashcards_to_add: [id], flashcards_to_remove: [], tags_to_add: [], tags_to_remove: []};
    fetchAuthPUT("decks/" + deck.id, 200, RequestBodyType.JSON, editedDeck);
}

export const createFlashcard = async (
    name: string,
    frontText: string,
    backText: string,
    frontMediaFiles: File[],
    backMediaFiles: File[],
    tags: string[],
    decks: Deck[],
) => {
    const content = {
        "name": name,
        "front": {
            "content": frontText
        },
        "back": {
            "content": backText
        }, 
        "tags": tags
    };

    const onSuccess = async (response: Response) => {
        const result = await response.json();

        await Promise.all(frontMediaFiles.map(file => uploadMedia(result.front_side.id, file)));
        await Promise.all(backMediaFiles.map(file => uploadMedia(result.back_side.id, file)));
        await Promise.all(decks.map(deck => addToDeck(result.id, deck)));
    }

    fetchAuthPOST("flashcards", OK, RequestBodyType.JSON, content, onSuccess)
}