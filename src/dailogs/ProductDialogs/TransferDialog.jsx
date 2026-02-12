import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    IconButton,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PersonIcon from "@mui/icons-material/Person";
import NumbersIcon from "@mui/icons-material/Numbers";

import ConfirmDialog from "../ConfirmDialog"; 
import { useUsers } from "../../hooks/useUsers";
import { TransUserProductQuantity } from "../../api/userProduct.api";
import { useToast } from "../../hooks/useToast"; 
import { btnOutlineSx, closeBtnSx, dialogPaperSx, inputSx, primaryBtnSx, selectSx } from "../../Comps/SomeAttrs";

// function isAdminRole() {
//     return String(localStorage.getItem("role") || "").toLowerCase() === "admin";
// }

export function TransferDialog({
    open,
    onClose,
    product, // { productId, productName, quantity }
    currentUserId, // المستخدم المعروض مخزونه (على الداشبورد)
    onTransferred, // callback لتحديث الجدول بعد نجاح التحويل
}) {
    const showToast = useToast();
    const { users, usersLoading } = useUsers();

    const [receiverId, setReceiverId] = useState("");
    const [qty, setQty] = useState("");
    const [touched, setTouched] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const availableQty = Number(product?.quantity ?? 0);

    // reset on open/product change
    useEffect(() => {
        if (!open) return;
        setReceiverId("");
        setQty("");
        setTouched(false);
        setConfirmOpen(false);
        setSubmitting(false);
    }, [open, product?.productId]);

    // receivers list: استبعد المستخدم الحالي (مش منطقي يحول لنفسه)
    const receivers = useMemo(() => {
        return (users || []).filter(
            (u) => Number(u.userId) !== Number(currentUserId),
        );
    }, [users, currentUserId]);

    // default receiver (أول واحد)
    useEffect(() => {
        if (!open) return;
        if (receiverId) return;
        if (usersLoading) return;
        const first = receivers?.[0];
        if (first?.userId) setReceiverId(String(first.userId));
    }, [open, receiverId, usersLoading, receivers]);

    const qtyValue = useMemo(() => {
        const v = Number(String(qty).trim());
        return v;
    }, [qty]);

    const error = useMemo(() => {
        if (!touched) return "";

        if (!receiverId) return "اختر المستخدم المستلم";
        if (!qty) return "أدخل الكمية";
        if (!Number.isFinite(qtyValue) || qtyValue <= 0)
            return "الكمية لازم تكون رقم أكبر من صفر";
        if (!Number.isInteger(qtyValue)) return "الكمية لازم تكون رقم صحيح";
        if (qtyValue > availableQty)
            return `لا يمكن أن تتجاوز المتاح (${availableQty})`;
        return "";
    }, [touched, receiverId, qty, qtyValue, availableQty]);

    const canSave = !error && availableQty > 0 && !submitting;

    const openConfirm = (e) => {
        e.preventDefault();
        setTouched(true);
        if (!canSave) return;
        setConfirmOpen(true);
    };

    const doTransfer = async () => {
        const payload = {
            productId: Number(product.productId),
            userId: Number(receiverId), // المستلم
            qty: Number(qtyValue),
        };

        try {
            setSubmitting(true);
            await TransUserProductQuantity(payload);

            showToast({
                message: "تم التحويل بنجاح",
                icon: <SwapHorizIcon />,
                severity: "success",
                duration: 2000,
            });

            // ✅ تحديث UI: نقص من المعروض حالياً
            onTransferred?.({
                productId: payload.productId,
                qty: payload.qty,
                receiverUserId: payload.userId,
            });

            setConfirmOpen(false);
            onClose?.();
        } catch {
            showToast({
                message: "فشل التحويل. حاول مرة أخرى.",
                icon: <SwapHorizIcon />,
                severity: "error",
                duration: 2500,
            });
            setConfirmOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    if (!product) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={submitting ? undefined : onClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: dialogPaperSx }}
            >
                <DialogTitle
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                            تحويل مخزون
                        </Typography>
                        <Typography
                            sx={{ color: "text.secondary", fontSize: 13 }}
                        >
                            {product.productName} — المتاح: {availableQty}
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={onClose}
                        sx={closeBtnSx}
                        disabled={submitting}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider sx={{ borderColor: "#1e293b" }} />

                <DialogContent sx={{ pt: 2 }}>
                    <Box component="form" onSubmit={openConfirm}>
                        <Stack spacing={2}>
                            <FormControl
                                fullWidth
                                sx={selectSx}
                                disabled={submitting || usersLoading}
                            >
                                <InputLabel>المستخدم المستلم</InputLabel>
                                <Select
                                    label="المستخدم المستلم"
                                    value={receiverId}
                                    onChange={(e) =>
                                        setReceiverId(e.target.value)
                                    }
                                    onBlur={() => setTouched(true)}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <PersonIcon
                                                sx={{ color: "text.secondary" }}
                                            />
                                        </InputAdornment>
                                    }
                                >
                                    {receivers.map((u) => (
                                        <MenuItem
                                            key={u.userId}
                                            value={String(u.userId)}
                                        >
                                            {u.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="الكمية المراد تحويلها"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                onBlur={() => setTouched(true)}
                                error={Boolean(error)}
                                helperText={error || " "}
                                inputProps={{ inputMode: "numeric" }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <NumbersIcon
                                                sx={{ color: "text.secondary" }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                                disabled={submitting || availableQty <= 0}
                            />
                        </Stack>

                        <Divider sx={{ my: 2, borderColor: "#1e293b" }} />

                        <DialogActions sx={{ p: 0 }}>
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                sx={btnOutlineSx}
                                disabled={submitting}
                            >
                                إلغاء
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={
                                    submitting ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <SwapHorizIcon />
                                    )
                                }
                                disabled={!canSave}
                                sx={primaryBtnSx}
                            >
                                {submitting ? "جاري..." : "حفظ"}
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                title="تأكيد التحويل"
                danger={false}
                confirmText="تأكيد"
                cancelText="إلغاء"
                loading={submitting}
                icon={<SwapHorizIcon />}
                message={`هل تريد تحويل ${qtyValue || 0} من "${product.productName}" للمستخدم المحدد؟`}
                onClose={() => (submitting ? null : setConfirmOpen(false))}
                onConfirm={doTransfer}
            />
        </>
    );
}

/* styles */




