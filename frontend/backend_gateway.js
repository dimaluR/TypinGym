const BACKEND_PROTO = "http";
const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 5007;
const backendUrl = `${BACKEND_PROTO}://${BACKEND_HOST}:${BACKEND_PORT}`;

export default async function sendRequestToBackend(route, method = "GET", data = null) {
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
