export type CardToLearnResult = {
    id: number;
    last_review_date: Date | undefined;
    next_review_date: Date;
    efactor: number;
    front_side: CardSide;
    back_side: CardSide;
}

type CardSide = {
    id: number;
    content: string;
    media_id: number[];
}
