"use client";
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

            fetch("http://127.0.0.1:8000/logout", requestOptions)
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