import { fetchAuthGET, fetchAuthPUT, OK } from "@/app/lib/fetch";
import { RequestBodyType } from "@/app/lib/fetchOptions";
import { Dispatch, SetStateAction } from "react";
import { ReportType } from "./types";

export const fetchGetReports = (
    setData: Dispatch<SetStateAction<ReportType[] | undefined>>,
    page: number,
    setTotal: Dispatch<SetStateAction<number>>,
    pageSize: number,
    verdictFilter?: 'all' | 'violation' | 'no-violation' | 'pending',
    sortOrder?: 'asc' | 'desc'
) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setData(result.reports);
        setTotal(result.total_number)
    }
    fetchAuthGET(`reports?page=${page + 1}&page_size=${pageSize}&verdict=${verdictFilter}&sort_order=${sortOrder}`, OK, onSuccess);
}

export const fetchGetReport = (
    setData: Dispatch<SetStateAction<ReportType | undefined>>,
    setDeckId: Dispatch<SetStateAction<number | undefined>>,
    id: number
) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setData(result);
        if (result.comment_id !== undefined) {
            const onSuccessComment = async (responseComment: Response) => {
                const resultComment = await responseComment.json();
                setDeckId(resultComment.deck_id);
            }
            fetchAuthGET(`comments/${result.comment_id}`, OK, onSuccessComment);
        }
    }
    fetchAuthGET(`reports/${id}`, OK, onSuccess);
}

export const fetchSetVerdict = (
    verdict: string,
    id: number,
    setReport: Dispatch<SetStateAction<ReportType | undefined>>
) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setReport(result);
    }
    fetchAuthPUT(`reports/${id}`, OK, RequestBodyType.JSON, { verdict: verdict }, onSuccess);
}