export type FlashcardSide = {
    id: number,
    content: string,
    media_id: number[]
}

export type Flashcard = {
    id: number,
    name: string,
    owner_id: number,
    creation_date: string,
    front_side: FlashcardSide,
    back_side: FlashcardSide
}
