// src/api/userProductApi.js
import { http } from "./http";

export async function TransUserProductQuantity(payload) {
    // payload: { productId, userId, qty }
    const res = await http.put(
        "/UserProduct/TransUserProductQuantity",
        payload,
    );
    return res.data;
}

export async function updateUserProductQuantity(payload) {
    // payload: { productId, userId, qty }
    const res = await http.put(
        "/UserProduct/UpdateUserProductQuantity",
        payload,
    );
    return res.data;
}
