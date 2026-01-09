import { fetchAuthPOST, fetchWithoutAuthPOST, OK, RequestBodyType } from "@/app/lib/fetch";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const loginFetch = async (
    username: string, 
    password: string, 
    router: AppRouterInstance
) => {
    const body = {
        "login": username,
        "password": password
    }
    const onSuccess = async (response: Response) => {
        const result = await response.json()
        if (result['token']) {
            localStorage.setItem("token", result['token']);
            router.push("/");
        }
        else {
            alert("Wrong credentials")
        }
    }

    fetchWithoutAuthPOST("login", OK, RequestBodyType.JSON, body, onSuccess);
}

export const registerFetch = async (
    username: string, 
    email: string, 
    password: string, 
    router: AppRouterInstance
) => {
    const body = {
        "username": username,
        "email": email,
        "password": password
    }
    const onSuccess = async (response: Response) => {
        const result = await response.json()
        if (result['token']) {
            localStorage.setItem("token", result['token']);
            router.push("/");
        }
        else {
            if (result.detail) {
                if (Array.isArray(result.detail)) {
                    const errorMessages = result.detail.map(
                        (err: { ctx: { reason: any; }; }) => err.ctx.reason
                    ).join('\n');
                    alert(errorMessages);
                }
                else if (result.detail.errors && Array.isArray(result.detail.errors)) {
                    const errorMessages = result.detail.errors.join('\n');
                    alert(errorMessages);
                }
                else {
                    alert('Registration failed. Please try again.');
                }

            }
        }
    }

    fetchWithoutAuthPOST("register", OK, RequestBodyType.JSON, body, onSuccess);
}

export const logoutFetch =  async (router: AppRouterInstance) => {
    const onSuccess = async (_response: Response) => {
        localStorage.removeItem("token");
        router.push("/");
    }
    fetchAuthPOST("logout", OK, RequestBodyType.EMPTY, undefined, onSuccess);
}