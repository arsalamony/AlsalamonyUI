import { http } from "./http";

export async function loginApi(payload) {
    // payload: { username, password }
    const res = await http.post("/Auth/Login", payload);
    return res.data;
}

