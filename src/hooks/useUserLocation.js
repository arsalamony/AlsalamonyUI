import { useContext } from "react";

import { UserLocationContext } from "../contexts/UserLocationContext";

export function useUserLocation() {
    const ctx = useContext(UserLocationContext);
    if (!ctx)
        throw new Error(
            "useUserLocation must be used within UserLocationProvider",
        );
    return ctx;
}
