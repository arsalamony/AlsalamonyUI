import { http } from "./http";

export async function getSystemRecords() {
    const res = await http.get("/SystemRecord/All");
    return res.data; // SystemRecordsResponse[]
}

export async function finishSystemRecord(id) {
    const res = await http.put(`/SystemRecord/Finish/${id}`);
    return res.data;
}
