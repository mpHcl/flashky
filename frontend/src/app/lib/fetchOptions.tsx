export type RequestOptions = {
    method: string,
    headers: Headers,
    body?: string | FormData
}

export enum RequestBodyType {
    JSON,
    EMPTY,
    FORM_DATA,
}

export const authHeaders = () => {
    const headers = new Headers();
    const token = localStorage.getItem("token");
    headers.append("Authorization", `Bearer ${token}`);

    return headers;
}

export const authHeadersJSON = () => {
    const headers = authHeaders();
    headers.append("Content-Type", "application/json");
    return headers
}

export const getRequestOptionsAuthorized = (): RequestOptions => {
    return {
        method: "GET",
        headers: authHeadersJSON(),
    }
}

export const requestWithBodyOptionsAuthorized = (
    type: RequestBodyType,
    method: string,
    payload?: object | FormData,
): RequestOptions => {
    switch (type) {
        case RequestBodyType.JSON:
            return {
                method: method,
                headers: authHeadersJSON(),
                body: JSON.stringify(payload as object)
            }

        case RequestBodyType.EMPTY:
            return {
                method: method,
                headers: authHeadersJSON(),
            }

        case RequestBodyType.FORM_DATA:
            return {
                method: method,
                headers: authHeaders(),
                body: payload as FormData
            }

        default:
            throw new Error(`Unsupported ${method} body type`);
    }
};

export const deleteRequestOptionsAuthorized = (): RequestOptions => {
    return {
        method: "DELETE",
        headers: authHeadersJSON(),
    }
}