// src/api/paymentsApi.js
import { http } from "./http";

export async function getPaymentsByUserId(userId) {
    const res = await http.get(`/Payment/GetAll/${Number(userId)}`);
    return res.data; // array
}

export async function addPayment(payload) {
    // AddPaymentRequest
    const res = await http.post("/Payment/Add", payload);
    return res.data;
}

export async function addPaymentByAdmin(payload) {
    // AddPaymentByAdminRequest
    const res = await http.post("/Payment/AddByAdmin", payload);
    return res.data;
}

export async function finshAllPayment(userId) {
    const res = await http.post(`/Payment/FinshAllPayment/${userId}`);
    return res.data;
}

export async function finshPayment(paymentId) {
    const res = await http.post(`/Payment/FinshPayment/${paymentId}`);
    return res.data;
}
