import { UsersContext } from "../contexts/UsersContext";
import React, { useContext } from "react";

export function useUsers() {
    const ctx = useContext(UsersContext);
    if (!ctx) throw new Error("useUsers must be used within UsersProvider");
    return ctx;
}
