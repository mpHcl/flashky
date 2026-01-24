import { fetchAuthGET, OK } from "@/app/lib/fetch";
import { Dispatch, SetStateAction } from "react";

export const fetchGetUserTheme = (
    setTheme: (theme: string) => void
) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setTheme(result.settings.theme)
    }

    fetchAuthGET("users/me/settings", OK, onSuccess);
}