import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import CustomerForm from "./CustomerForm";

import { getCustomerById, updateCustomer } from "../../api/customer.api";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../api/apiError";

export default function CustomerEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const showToast = useToast();

    const [initialValues, setInitialValues] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const customer = await getCustomerById(id);

                setInitialValues({
                    name: customer.name ?? customer.customerName ?? "",
                    phone: customer.phone ?? "",
                    // ✅ خليها null بدل "" لو مش موجودة
                    addressId: customer.addressId ?? null,
                });
            } catch (err) {
                showToast({
                    message: getErrorMessage(err),
                    severity: "error",
                    duration: 2000,
                });
                navigate("/customers", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) {
        return (
            <Stack alignItems="center" sx={{ py: 6 }}>
                <CircularProgress />
                <Typography sx={{ mt: 1, color: "text.secondary" }}>
                    جاري تحميل بيانات العميل...
                </Typography>
            </Stack>
        );
    }

    if (!initialValues) return null;

    return (
        <CustomerForm
            key={id}
            title={`تعديل عميل (ID: ${id})`}
            initialValues={initialValues}
            onSubmit={async (payload) => {
                try {
                    await updateCustomer(id, payload);
                    showToast({
                        message: "تم تعديل العميل بنجاح",
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
