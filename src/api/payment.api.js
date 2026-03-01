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

// GET /Payment/GetAll?PageNo=1&PageSize=10
export async function getAllPaymentsPaged(pageNo = 1, pageSize = 10) {
    const res = await http.get("/Payment/GetAll", {
        params: { PageNo: Number(pageNo), PageSize: Number(pageSize) },
    });
    return res.data; // PaymentViewResponse[]
}

// DELETE /Payment/Delete/{paymentId}
export async function deletePayment(paymentId) {
    const res = await http.delete(`/Payment/Delete/${paymentId}`);
    return res.data;
}

// ✅ جديد: عدد الدفعات
export async function getPaymentNo() {
    const res = await http.get("/Payment/PaymentNo");
    return res.data; // number
}

export async function finshAllPayment(userId) {
    const res = await http.post(`/Payment/FinshAllPayment/${userId}`);
    return res.data;
}

export async function finshPayment(paymentId) {
    const res = await http.post(`/Payment/FinshPayment/${paymentId}`);
    return res.data;
}
