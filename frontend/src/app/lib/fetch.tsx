import { BASE_URL } from "../constants";

export const OK = 200;

export type RequestOptions = {
    method: string,
    headers: Headers,
    body?: string | FormData
}

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

const authHeaders = () => {
    const headers = new Headers();
    const token = localStorage.getItem("token");
    headers.append("Authorization", `Bearer ${token}`);

    return headers;
}

const authHeadersJSON = () => {
    const headers = authHeaders();
    headers.append("Content-Type", "application/json");
    return headers
}

const getRequestOptionsAuthorized = (): RequestOptions => {
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

export enum RequestBodyType {
    JSON,
    EMPTY,
    FORM_DATA,
}

const requestWithBodyOptionsAuthorized = (
    type: RequestBodyType,
    method: string,
    payload?: object | FormData,
): RequestOptions => {
    switch (type) {
        case RequestBodyType.JSON:
            return requestWithBodyJSONRequestOptionsAuthorized(method, payload as object);

        case RequestBodyType.EMPTY:
            return requestWithBodyEmptyRequestOptionsAuthorized(method);

        case RequestBodyType.FORM_DATA:
            return requestWithBodyFormDataRequestOptionsAuthorized(method, payload as FormData);

        default:
            throw new Error(`Unsupported ${method} body type`);
    }
};

const requestWithBodyJSONRequestOptionsAuthorized = (method: string, body: object): RequestOptions => {
    const stringifiedBody = JSON.stringify(body);
    return {
        method: method,
        headers: authHeadersJSON(),
        body: stringifiedBody
    }
}

const requestWithBodyEmptyRequestOptionsAuthorized = (method: string): RequestOptions => {
    return {
        method: method,
        headers: authHeadersJSON(),
    }
}

const requestWithBodyFormDataRequestOptionsAuthorized = (method: string, data: FormData): RequestOptions => {
    return {
        method: method,
        headers: authHeaders(),
        body: data
    }
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
  
export const fetchAuthDelete = async (
    url: string,
    expectedStatusCode: number,
    onSuccess?: (response: Response) => Promise<void>,
    onFail?: (response: Response) => Promise<void>,
) => {
    const options = {
        method: "DELETE",
        headers: authHeaders()
    };

    return fetchLib(options, url, expectedStatusCode, onSuccess, onFail);
}