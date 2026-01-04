type FlashcardSide = {
    id: number,
    content: string | null,
    media: number[]
}

export type Flashcard = {
    id: number,
    name: string,
    owner_id: number,
    creation_date: string,
    front_side: FlashcardSide,
    back_side: FlashcardSide
}

export type DeckPostDTO = {
    name: string,
    description: string,
    isPublic: boolean,
    flashcards_ids: number[],
    tags: string[]
}