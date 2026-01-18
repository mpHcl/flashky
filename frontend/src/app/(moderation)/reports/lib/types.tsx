export type ReportType = {
    id: number;
    type: string;
    description: string;
    creation_date: string;
    resolution_date: string | undefined;
    verdict: string | undefined;

    deck_id: number | undefined;
    flashcard_id: number | undefined;
    comment_id: number | undefined;
    reported_user_id: number
    reporter_id: number
    moderator_id: number | undefined;
}