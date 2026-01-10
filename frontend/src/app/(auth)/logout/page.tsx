"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logoutFetch } from "../lib/fetch";
import { useAuth } from "../context/AuthContext";

export default function Logout() {
    const router = useRouter();
    const {logout} = useAuth();

    useEffect(() => {
        logoutFetch(router, logout);
    }, []);

    return (<h1>Logging out...</h1>);
}