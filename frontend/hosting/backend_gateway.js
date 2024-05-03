const BACKEND_HOST = "https://typingym-85269.web.app";
const BACKEND_HOST_DEV = "https://127.0.0.1:5007";
const backendUrl = import.meta.env.VITE_BACKEND_ENV === "dev" ? BACKEND_HOST_DEV : BACKEND_HOST;
console.log(`vite backend env: ${ import.meta.env.VITE_BACKEND_ENV }`)
console.log(`vite env: ${ import.meta.env.VITE_ENV }`)

export default async function sendRequestToBackend(route, method = "GET", data = null) {
    console.log(`sending request to backend API: ${route}`)
    const requestOptions = {
        method: method,
    };

    if (method.toUpperCase() === "POST") {
        requestOptions["body"] = JSON.stringify(data);
        requestOptions["headers"] = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };
    }

    try {
        const response = await fetch(`${backendUrl}/${route}`, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP response error: ${response.status}`);
        }
        const text = await response.json();
        return text;
    } catch (error) {
        throw error;
    }
}
