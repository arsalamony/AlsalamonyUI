import { http } from "./http";

export async function getAllCustomers() {
    const res = await http.get("/Customer/All");
    return res.data; // المفروض array
}

export async function getCustomerById(customerId) {
    const res = await http.get(`/Customer/Get/${customerId}`);
    return res.data;
}

export async function addCustomer(payload) {
    // payload: { name, phone, addressId }
    const res = await http.post("/Customer/Add", payload);
    return res.data;
}

export async function updateCustomer(customerId, payload) {
    // payload: { name, phone, addressId }
    const res = await http.put(
        `/Customer/Update/${customerId}`,
        payload,
    );
    return res.data;
}


