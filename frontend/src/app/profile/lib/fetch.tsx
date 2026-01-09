import { logoutFetch } from "@/app/(auth)/lib/fetch";
import { RequestBodyType } from "@/app/lib/fetchOptions";
import { fetchAuthDELETE, fetchAuthGET, fetchAuthPUT, OK } from "@/app/lib/fetch";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

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
    router: AppRouterInstance
) => {
    const onSuccess = async (response: Response) => {
        logoutFetch(router);
    }

    const onFail = async (response: Response) => {
        alert("Failed to delete profile");
    }

    fetchAuthDELETE("users/me", OK, onSuccess, onFail);
}

export const fetchChangePassword = (
    oldPassword: string,
    newPassword: string
) => {
    const onSuccess = async (response: Response) => {
        alert("Password changed successfully");
    }

    const onFail = async (response: Response) => {
        await response.json().then(results => {
            var errorsString = "";
            if (results.detail.errors !== undefined) {
                results.detail.errors.forEach((error: string) => {
                    errorsString += error + "\n";
                });
            }
            else {
                errorsString = results.detail;
            }

            alert("Failed to change password\nDetails:\n" + errorsString);
        });
    }

    const data = { old_password: oldPassword.trim(), new_password: newPassword.trim() };
    fetchAuthPUT("users/change_password", OK, RequestBodyType.JSON, data, onSuccess, onFail);
}
