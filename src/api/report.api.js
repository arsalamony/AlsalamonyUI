import { http } from "./http";

export async function getIncomeReport() {
    const res = await http.get("/Report/Income");
    return res.data;
}
