import { PaymentMethodsContext } from "../contexts/PaymentMethodsContext";
import { useContext } from "react";


export function usePaymentMethods() {
    const ctx = useContext(PaymentMethodsContext);
    if (!ctx)
        throw new Error(
            "usePaymentMethods must be used within PaymentMethodsProvider",
        );
    return ctx;
}
