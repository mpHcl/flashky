import { fetchAuthDelete, fetchAuthGET } from "@/app/lib/fetch";
import { Deck } from "@/app/lib/types";
import { Dispatch, SetStateAction } from "react";

export const getSavedDecks = (
  setData: Dispatch<SetStateAction<Deck[] | undefined>>,
  page: number,
  setTotal: Dispatch<SetStateAction<number>>,
  pageSize: number
) => {
  const onSuccess = async (response: Response) => {
    const result = await response.json();
    setData(result.decks);
    setTotal(result.total_number)
  }
  fetchAuthGET(`decks/saved?page=${page + 1}&page_size=${pageSize}`, 200, onSuccess);
}

export const removeSavedDeck = (id: number, setData: Dispatch<SetStateAction<Deck[] | undefined>>) => {
  const onSuccess = async () => {
    setData(prev => prev ? prev.filter(deck => deck.id !== id) : prev)
  }

  return fetchAuthDelete(`decks/${id}/save`, 200, onSuccess);
}