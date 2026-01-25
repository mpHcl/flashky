import { DialogType, ShowDialog } from "@/app/components/dialogs/AppDialog";
import { fetchAuthGET, fetchAuthPOST, fetchWithoutAuthPOST, OK } from "@/app/lib/fetch";
import { RequestBodyType } from "@/app/lib/fetchOptions";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Dispatch, SetStateAction } from "react";

export const loginFetch = async (
    username: string,
    password: string,
    router: AppRouterInstance,
    updateContext: (token: string) => void,
    showDialog: ShowDialog
) => {
    const body = {
        "login": username,
        "password": password
    }
    const onSuccess = async (response: Response) => {
        const result = await response.json()
        if (result['token']) {
            updateContext(result['token'])
            if (result['is_mod'])
                router.push("/users");
            else
                router.push("/");
        }
        else {
            showDialog("Unexpected error", DialogType.ERROR);
        }
    }

    const onFail = async () => {
        showDialog("Wrong credentials", DialogType.ERROR);
    }

    fetchWithoutAuthPOST("login", OK, RequestBodyType.JSON, body, onSuccess, onFail);
}

export const registerFetch = async (
    username: string,
    email: string,
    password: string,
    router: AppRouterInstance,
    updateContext: (token: string) => void,
    showDialog: ShowDialog
) => {
    const body = {
        "username": username,
        "email": email,
        "password": password
    }
    const onSuccess = async (response: Response) => {
        const result = await response.json()
        if (result['token']) {
            updateContext(result['token'])
            router.push("/");
        }
        else {
            showDialog("Unexpected error", DialogType.ERROR);
        }
    }

    const onFail = async (response: Response) => {
        const result = await response.json()

        if (result.detail) {
            if (Array.isArray(result.detail)) {
                const errorMessages = result.detail.map(
                    (err: { ctx: { reason: string; }; }) => err.ctx.reason
                ).join('\n');
                showDialog(errorMessages, DialogType.ERROR);
            }
            else if (result.detail.errors && Array.isArray(result.detail.errors)) {
                const errorMessages = result.detail.errors.join('\n');
                showDialog(errorMessages, DialogType.ERROR);
            }
            else {
                showDialog("Registration failed. Please try again.", DialogType.ERROR);
            }
        }
    }
    fetchWithoutAuthPOST("register", OK, RequestBodyType.JSON, body, onSuccess, onFail);
}

export const logoutFetch = async (
    router: AppRouterInstance,
    updateContext: () => void
) => {
    const onSuccess = async () => {
        updateContext()
        router.push("/");
    }
    fetchAuthPOST("logout", OK, RequestBodyType.EMPTY, undefined, onSuccess);
}

export const checkToken = (setIsAuthenticated: Dispatch<SetStateAction<boolean | null>>) => {
    if (!localStorage.getItem("token")) {
        setIsAuthenticated(false);
        return;
    }

    fetchAuthGET(
        "check_token",
        200,
        async () => { setIsAuthenticated(true) },
        async () => {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
        }
    )
}