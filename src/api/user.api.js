import { http } from "./http";

export async function getUsers() {
    const res = await http.get("/User/GetAll");
    return res.data; // UsersResponse[]
}

export async function getUserWithProducts(userId) {
    const res = await http.get(`/User/Get/${userId}`);
    return res.data; // UserResponse
}

export async function updateUserLocation(payload) 
{
    const res = await http.put(`/User/UpdateLocation`, payload)
    return res.data;
}