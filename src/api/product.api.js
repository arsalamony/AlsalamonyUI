import { http } from "./http";

export async function getAllProducts() {
    const res = await http.get("/Product/All");
    return res.data; // المفروض array
}

// export async function getProductById(customerId) {
//     const res = await http.get(`/Customer/Get/${customerId}`);
//     return res.data;
// }

// export async function addProduct(payload) {
//     // payload: { name, phone, addressId }
//     const res = await http.post("/Customer/Add", payload);
//     return res.data;
// }

// export async function updateProduct(customerId, payload) {
//     // payload: { name, phone, addressId }
//     const res = await http.put(
//         `/Customer/Update/${customerId}`,
//         payload,
//     );
//     return res.data;
// }

