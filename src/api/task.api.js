// src/api/taskApi.js
import { http } from "./http";

export async function getAllTasks() {
    const res = await http.get("/Task/All");
    return res.data; // TaskResponse[]
}

export async function getTaskById(id) {
    const res = await http.get(`/Task/Get/${id}`);
    return res.data; // TaskResponse
}

export async function addTask(payload) {
    // payload: AddTaskRequest
    const res = await http.post("/Task/Add", payload);
    return res.data;
}

export async function setTaskComplete(id) {
    // NoContent
    const res = await http.put(`/Task/SetComplete/${id}`);
    return res.data;
}

export async function deleteTask(id) {
    // Admin only - NoContent
    const res = await http.delete(`/Task/Delete/${id}`);
    return res.data;
}

export async function setCancelTask(id, notes) {
    await http.put(`/Task/SetCancel/${id}`, notes, {
        headers: { "Content-Type": "application/json" },
    });
}
