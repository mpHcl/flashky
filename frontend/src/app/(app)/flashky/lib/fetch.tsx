import { RequestBodyType } from "@/app/lib/fetchOptions";
import { fetchAuthDELETE, fetchAuthGET, fetchAuthPOST, fetchAuthPUT, OK } from "@/app/lib/fetch";
import { Dispatch, SetStateAction } from "react";
import { Deck, DeckUpdateDTO, Flashcard, FlashcardEditDTO, FlashcardSideCreateDTO, MediaInfo, MediaUpdateDTO } from "@/app/lib/types";

export const getFlashcard = async (id: number, setData: Dispatch<SetStateAction<Flashcard | undefined>>, setIsOwned: Dispatch<SetStateAction<boolean>>) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setData(result);
    }
    fetchAuthGET(`flashcards/${id}`, OK, onSuccess);

    const onSuccessIsOwned = async (response: Response) => {
      const result = await response.json();
      setIsOwned(result);
    }
    fetchAuthGET(`flashcards/${id}/isowned`, 200, onSuccessIsOwned)
}

export const uploadMedia = async (sideId: number, file: File) => {
    const formdata = new FormData();
    formdata.append("file", file);

    fetchAuthPOST(`media/${sideId}`, OK, RequestBodyType.FORM_DATA, formdata);
}

const updateMedia = async (mediaInfo: MediaInfo) => {
    const info: MediaUpdateDTO = { alt: mediaInfo.alt, autoplay: mediaInfo.autoplay };
    fetchAuthPUT(`media/${mediaInfo.id}`, OK, RequestBodyType.JSON, info);
}

export const deleteMedia = async (mediaId: number) => {
    fetchAuthDELETE(`media/${mediaId}`, OK);
}

const addToDeck = async (id: number, deck: Deck) => {
    const editedDeck: DeckUpdateDTO = { name: deck.name, description: deck.description, public: deck.public, flashcards_to_add: [id], flashcards_to_remove: [], tags_to_add: [], tags_to_remove: [] };
    fetchAuthPUT("decks/" + deck.id, 200, RequestBodyType.JSON, editedDeck);
}

const removeFromDeck = async (id: number, deck: Deck) => {
    const editedDeck: DeckUpdateDTO = { name: deck.name, description: deck.description, public: deck.public, flashcards_to_add: [], flashcards_to_remove: [id], tags_to_add: [], tags_to_remove: [] };
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

export const editFlashcard = async (
    id: number,
    name: string,
    frontText: string,
    backText: string,
    frontMediaFiles: File[],
    backMediaFiles: File[],
    frontMediaInfos: MediaInfo[],
    backMediaInfos: MediaInfo[],
    frontMediaToRemove: number[],
    backMediaToRemove: number[],
    tagsToAdd: string[],
    tagsToRemove: string[],
    decksToAdd: Deck[],
    decksToRemove: Deck[],
) => {
    const front: FlashcardSideCreateDTO = { content: frontText };
    const back: FlashcardSideCreateDTO = { content: backText };
    const flashcard: FlashcardEditDTO = { name: name, front: front, back: back, tags_to_add: tagsToAdd, tags_to_remove: tagsToRemove };

    const onSuccess = async (response: Response) => {
        const result = await response.json();

        await Promise.all(frontMediaFiles.map(file => uploadMedia(result.front_side.id, file)));
        await Promise.all(backMediaFiles.map(file => uploadMedia(result.back_side.id, file)));
        await Promise.all(frontMediaInfos.map(info => updateMedia(info)));
        await Promise.all(backMediaInfos.map(info => updateMedia(info)));
        await Promise.all(frontMediaToRemove.map(mediaId => deleteMedia(mediaId)));
        await Promise.all(backMediaToRemove.map(mediaId => deleteMedia(mediaId)));
        await Promise.all(decksToAdd.map(deck => addToDeck(result.id, deck)));
        await Promise.all(decksToRemove.map(deck => removeFromDeck(result.id, deck)));
    }

    fetchAuthPUT(`flashcards/${id}`, OK, RequestBodyType.JSON, flashcard, onSuccess);
}