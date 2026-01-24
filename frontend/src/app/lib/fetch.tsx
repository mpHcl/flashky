import { BASE_URL } from "../constants";
import { deleteRequestOptionsAuthorized, getRequestOptionsAuthorized, RequestBodyType, RequestOptions, requestWithBodyOptionsAuthorized } from "./fetchOptions";

export const OK = 200;

export const fetchLib = async (
    options: RequestOptions,
    url: string,
    expectedStatusCode: number,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    try {
        const response = await fetch(`${BASE_URL}${url}`, options);
        if (response.status === expectedStatusCode) {
            await onSuccess?.(response);
        }
        else {
            await onFail?.(response);
        }

        return response.status;
    }
    catch (error) {
        console.log(error);
    }
}

export const fetchAuthGET = async (
    url: string,
    expectedStatusCode: number,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    const options = getRequestOptionsAuthorized()
    return fetchLib(options, url, expectedStatusCode, onSuccess, onFail);
}

export const fetchAuthPOST = async (
    url: string,
    expectedStatusCode: number,
    type: RequestBodyType,
    body?: object,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    const options = requestWithBodyOptionsAuthorized(type, "POST", body);
    return fetchLib(options, url, expectedStatusCode, onSuccess, onFail);
}

export const fetchWithoutAuthPOST = async (
    url: string,
    expectedStatusCode: number,
    type: RequestBodyType,
    body: object,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    if (type !== RequestBodyType.JSON) {
        throw new Error("Not implemented yet.");
    }
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const options = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    }
    return fetchLib(options, url, expectedStatusCode, onSuccess, onFail);
}

export const fetchAuthPUT = async (
    url: string,
    expectedStatusCode: number,
    type: RequestBodyType,
    body?: object,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    const options = requestWithBodyOptionsAuthorized(type, "PUT", body);
    return fetchLib(options, url, expectedStatusCode, onSuccess, onFail);
}

export const fetchAuthDELETE = async (
    url: string,
    expectedStatusCode: number,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    const options = deleteRequestOptionsAuthorized();
    return fetchLib(options, url, expectedStatusCode, onSuccess, onFail);
}