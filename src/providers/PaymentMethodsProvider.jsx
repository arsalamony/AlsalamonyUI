import { PaymentMethodsContext } from "../contexts/PaymentMethodsContext";
import { useMemo } from "react";


const STATIC_PAYMENT_METHODS = [
    { value: 1, label: "نقدي" },
    { value: 2, label: "فودافون كاش المحل" },
    { value: 3, label: "الأستاذ محمد" },
];

export function PaymentMethodsProvider({ children }) {
    const value = useMemo(() => {
        const byValue = new Map(
            STATIC_PAYMENT_METHODS.map((m) => [Number(m.value), m]),
        );

        return {
            paymentMethods: STATIC_PAYMENT_METHODS,

            getPaymentMethodLabel: (v) => byValue.get(Number(v))?.label ?? "",
        };
    }, []);

    return (
        <PaymentMethodsContext.Provider value={value}>
            {children}
        </PaymentMethodsContext.Provider>
    );
}

