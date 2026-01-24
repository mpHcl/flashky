import { logoutFetch } from "@/app/(auth)/lib/fetch";
import { RequestBodyType } from "@/app/lib/fetchOptions";
import { fetchAuthDELETE, fetchAuthGET, fetchAuthPOST, fetchAuthPUT, OK } from "@/app/lib/fetch";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DialogType, ShowDialog } from "@/app/components/dialogs/AppDialog";
import { Profile } from "./types";

export const fetchProfile = (
    setProfile: React.Dispatch<React.SetStateAction<Profile | undefined>>
) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        if (result.description === null)
            result.description = "";

        setProfile(result);
    }

    fetchAuthGET("users/me", OK, onSuccess);
}

export const fetchSaveProfile = (
    profile: Profile | undefined,
    setProfile: React.Dispatch<React.SetStateAction<Profile | undefined>>
) => {
    const data = {
        username: profile?.username,
        email: profile?.email,
        description: profile?.description,
    }

    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setProfile(result);
    }
    fetchAuthPUT("users/me", OK, RequestBodyType.JSON, data, onSuccess);
}

export const fetchDeleteProfile = (
    router: AppRouterInstance,
    updateContext: () => void,
    showDialog: ShowDialog
) => {
    const onSuccess = async () => {
        logoutFetch(router, updateContext);
    }

    const onFail = async () => {
        showDialog("Failed to delete profile", DialogType.ERROR);
    }

    fetchAuthDELETE("users/me", OK, onSuccess, onFail);
}

export const fetchChangePassword = (
    oldPassword: string,
    newPassword: string,
    showDialog: ShowDialog
) => {
    const onSuccess = async () => {
        showDialog("Password changed successfully", DialogType.INFO);
    }

    const onFail = async (response: Response) => {
        await response.json().then(results => {
            let errorsString = "";
            if (results.detail.errors !== undefined) {
                results.detail.errors.forEach((error: string) => {
                    errorsString += error + "\n";
                });
            }
            else {
                errorsString = results.detail;
            }

            showDialog(
                "Failed to change password\nDetails:\n" + errorsString,
                DialogType.ERROR,
            );
        });
    }

    const data = { old_password: oldPassword.trim(), new_password: newPassword.trim() };
    fetchAuthPUT("users/change_password", OK, RequestBodyType.JSON, data, onSuccess, onFail);
}

export const fetchChangeAvatar = (
    file: File,
    setProfile: React.Dispatch<React.SetStateAction<Profile | undefined>>) => {
    const onSuccess = async (response: Response) => {
        const result = await response.json();
        setProfile(prev => prev && ({ ...prev, avatar: result.avatar }));
    }
    
    const data = new FormData();
    data.append("avatar", file);
    fetchAuthPOST("users/upload_avatar", OK, RequestBodyType.FORM_DATA, data, onSuccess);
}
