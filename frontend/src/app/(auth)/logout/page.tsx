"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logoutFetch } from "../lib/fetch";

export default function Logout() {
    const router = useRouter();
    useEffect(() => {
        logoutFetch(router);
    }, []);

    return (<h1>Logging out...</h1>);
}