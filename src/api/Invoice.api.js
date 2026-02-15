import { http } from "./http";

export async function addInvoice(payload) {
    const res = await http.post("/Invoice/Add", payload);
    return res.data;
}

export async function getInvoiceById(invoiceId) {
    const res = await http.get(`/Invoice/Get/${invoiceId}`);
    return res.data;
}

export async function getUnpaidInvoicesByCustomer(customerId) {
    const res = await http.get("/Invoice/GetAllUnpayed", {
        params: { CustomerId: Number(customerId) },
    });
    return res.data; // المفروض array
}

export async function addInvoicePayment(payload) {
    // payload: { invoiceId, amountPaid, notes, paymentMethod }
    const res = await http.post("/Invoice/InvoicePayment", payload);
    return res.data;
}

export async function FullDeleteInvoice(InvoiceId) {
    const res = await http.delete(`/Invoice/FullDelete/${InvoiceId}`);
    return res.data;
}
