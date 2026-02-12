import { AddressesContext } from "../contexts/AddressesContext";
import { useContext } from "react";

export function useAddresses() {
    const ctx = useContext(AddressesContext);
    if (!ctx)
        throw new Error("useAddresses must be used within AddressesProvider");
    return ctx;
}
