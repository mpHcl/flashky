"use client";
import { BASE_URL } from "@/app/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
    const router = useRouter();
    useEffect(() => {
        const logOut = async () => {
            const myHeaders = new Headers();
            let token = localStorage.getItem("token")
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                redirect: "follow"
            };

            fetch(BASE_URL + "logout", requestOptions)
                .then((response) => {
                    return response.json()
                })
                .then(_ => {
                    localStorage.removeItem("token");
                    router.push("/");
                })
                .catch((error) => console.log(error));
        }
        logOut();
    }, []);

    return (<h1>Logging out...</h1>);
}