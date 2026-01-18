import { DialogType, ShowDialog } from "@/app/components/dialogs/AppDialog";
import { fetchAuthDELETE, fetchAuthGET, fetchAuthPUT, OK } from "@/app/lib/fetch";
import { RequestBodyType } from "@/app/lib/fetchOptions";
import { Dispatch, SetStateAction } from "react";
import { User } from "./types";

export const getUsers = (
    setData: Dispatch<SetStateAction<User[] | undefined>>,
    page: number,
    setTotal: Dispatch<SetStateAction<number>>,
    pageSize: number
) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setData(result.users);
        setTotal(result.total_number)
    }
    fetchAuthGET(`users?page=${page + 1}&page_size=${pageSize}`, OK, onSuccess);
}

export const getUser = (
    setUser: Dispatch<SetStateAction<User | undefined>>,
    userId: number,
) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setUser(result);
    }
    fetchAuthGET(`users/${userId}`, OK, onSuccess);
}

export const fetchDeactivateUser = (
    userId: number,
    setUser: Dispatch<SetStateAction<User | undefined>>,
    showDialog: ShowDialog
) => {
    const onSuccess = async () => {
        showDialog("User disabled successfully.", DialogType.INFO);
        setUser(prev => prev ? { ...prev, active: false } : prev);
    }

    const onFail = async () => {
        showDialog(`Failed to delete profile.`, DialogType.ERROR);
    }

    fetchAuthDELETE(`users/${userId}`, OK, onSuccess, onFail);
}

export const fetchActivateUser = (
    userId: number,
    setUser: Dispatch<SetStateAction<User | undefined>>,
    showDialog: ShowDialog
) => {
    const onSuccess = async () => {
        showDialog("User activated successfully.", DialogType.INFO);
        setUser(prev => prev ? { ...prev, active: true } : prev);
    }
    const onFail = async () => {
        showDialog(`Failed to activate profile.`, DialogType.ERROR);
    }

    fetchAuthPUT(`users/${userId}/activate`, OK, RequestBodyType.EMPTY, {}, onSuccess, onFail);
}