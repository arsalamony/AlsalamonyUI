import CustomerForm from "./CustomerForm";
import { useNavigate } from "react-router-dom";

import { addCustomer } from "../../api/customer.api";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../api/apiError";

export default function CustomerCreate() {
    const navigate = useNavigate();
    const showToast = useToast();

    return (
        <CustomerForm
            title="إضافة عميل"
            initialValues={{ name: "", phone: "", addressId: "" }}
            onSubmit={async (payload) => {
                try {
                    await addCustomer(payload);
                    showToast({
                        message: "تم إضافة العميل بنجاح",
                        severity: "success",
                        duration: 2000,
                    });
                    navigate("/customers");
                } catch (err) {
                    showToast({
                        message: getErrorMessage(err),
                        severity: "error",
                        duration: 2000,
                    });
                }
            }}
        />
    );
}
