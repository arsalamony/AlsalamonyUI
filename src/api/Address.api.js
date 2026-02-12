import { http } from "./http";

export async function getAllAddresses() {
    const res = await http.get("/Address/GetAll");
    return res.data;
}
