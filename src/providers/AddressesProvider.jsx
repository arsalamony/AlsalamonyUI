import { AddressesContext } from "../contexts/AddressesContext";
import { useMemo } from "react";


// ✅ 6 عناوين ثابتة
const STATIC_ADDRESSES = [
    { addressId: 1, addressName: "بني عدي" },
    { addressId: 2, addressName: "العزيه" },
    { addressId: 3, addressName: "العتامنه" },
    { addressId: 4, addressName: "بني سند" },
    { addressId: 5, addressName: "المندره" },
    { addressId: 6, addressName: "عزبة عبد الباقي" },
];

export function AddressesProvider({ children }) {
    const value = useMemo(() => {
        const byId = new Map(STATIC_ADDRESSES.map((a) => [a.addressId, a]));
        return {
            addresses: STATIC_ADDRESSES,
            getAddressName: (id) => byId.get(Number(id))?.addressName ?? "",
        };
    }, []);

    return (
        <AddressesContext.Provider value={value}>
            {children}
        </AddressesContext.Provider>
    );
}

