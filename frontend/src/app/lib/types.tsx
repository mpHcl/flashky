type FlashcardSide = {
    id: number,
    content: string | null,
    media: number[]
}

export type FlashcardSideCreateDTO = {
    content: string
}

export type MediaInfo = {
    id: number,
    alt: string,
    path: string,
    type: string,
    autoplay: boolean,
    upload_date: Date
}

export type MediaUpdateDTO = {
    alt: string,
    autoplay: boolean
}

export type Flashcard = {
    id: number,
    name: string,
    owner_id: number,
    creation_date: string,
    front_side: FlashcardSide,
    back_side: FlashcardSide
}

export type FlashcardEditDTO = {
    name: string,
    front: FlashcardSideCreateDTO,
    back: FlashcardSideCreateDTO,
    tags_to_add: string[],
    tags_to_remove: string[]
}

export type DeckPostDTO = {
    name: string,
    description: string,
    isPublic: boolean,
    flashcards_ids: number[],
    tags: string[]
}

export type FlashcardInDeck = {
  id: number,
  name: string,
  creation_date: Date
}

export type DeckUpdateDTO = {
  name: string,
  description: string,
  public: boolean,
  flashcards_to_add: number[],
  flashcards_to_remove: number[],
  tags_to_add: string[],
  tags_to_remove: string[]
}

export type Deck = {
  id: number,
  name: string,
  description: string,
  public: boolean,
  has_media: boolean,
  owner_id: number,
  tags: string[],
  flashcards: FlashcardInDeck[]
}