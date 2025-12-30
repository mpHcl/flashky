import { BASE_URL } from "../constants";

export type requestOptions = {
    method: string,
    headers: Headers,
    body?: string | FormData
}

export const fetchLib = async (
    options: requestOptions,
    url: string,
    expectedStatusCode: number,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    try {
        const response = await fetch(`${BASE_URL}${url}`, options);
        if (response.status !== expectedStatusCode) {
            await onFail?.(response);
        }

        await onSuccess?.(response);

        return response.status;
    }
    catch (error) {
        console.log(error);
    }
}

const authHeaders = () => {
    const headers = new Headers();
    let token = localStorage.getItem("token");
    headers.append("Authorization", `Bearer ${token}`);

    return headers;
}

const authHeadersJSON = () => {
    let headers = authHeaders();
    headers.append("Content-Type", "application/json");
    return headers
}

const getRequestOptionsAuthorized = (): requestOptions => {
    return {
        method: "GET",
        headers: authHeadersJSON(),
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

export enum PostBodyType {
    JSON,
    EMPTY,
    FORM_DATA,
}

const postRequestOptionsAuthorized = (
    type: PostBodyType,
    payload?: object | FormData,
): requestOptions => {
    switch (type) {
        case PostBodyType.JSON:
            return postJSONRequestOptionsAuthorized(payload as object);

        case PostBodyType.EMPTY:
            return postEmptyRequestOptionsAuthorized();

        case PostBodyType.FORM_DATA:
            return postFormDataRequestOptionsAuthorized(payload as FormData);

        default:
            throw new Error("Unsupported POST body type");
    }
};

const postJSONRequestOptionsAuthorized = (body: object): requestOptions => {
    const stringifiedBody = JSON.stringify(body);
    return {
        method: "POST",
        headers: authHeadersJSON(),
        body: stringifiedBody
    }
}

const postEmptyRequestOptionsAuthorized = (): requestOptions => {
    return {
        method: "POST",
        headers: authHeadersJSON(),
    }
}

const postFormDataRequestOptionsAuthorized = (data: FormData): requestOptions => {
    return {
        method: "POST",
        headers: authHeaders(),
        body: data
    }
}

export const fetchAuthPOST = async (
    url: string,
    expectedStatusCode: number,
    type: PostBodyType,
    body?: object,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    const options = postRequestOptionsAuthorized(type, body);
    return fetchLib(options, url, expectedStatusCode, onSuccess, onFail);
}