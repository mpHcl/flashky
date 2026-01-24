import { Dispatch, SetStateAction } from "react";
import { fetchAuthGET, fetchAuthPUT, OK } from "@/app/lib/fetch";
import { Settings } from "./type";
import { RequestBodyType } from "@/app/lib/fetchOptions";

export const fetchGetUserSettings = (
    setSettings: Dispatch<SetStateAction<Settings | undefined>>
) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setSettings(result.settings)
    }

    fetchAuthGET("users/me/settings", OK, onSuccess);
}

export const fetchUpdateUserSettings = (
    settings: Settings
) => {
    fetchAuthPUT("users/me/settings", OK, RequestBodyType.JSON, settings);
}
