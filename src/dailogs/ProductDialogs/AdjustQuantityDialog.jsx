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
    Stack,
    CircularProgress,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import NumbersIcon from "@mui/icons-material/Numbers";

import ConfirmDialog from "../../dailogs/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { updateUserProductQuantity } from "../../api/userProduct.api";
import { closeBtnSx, btnOutlineSx, inputSx, dialogPaperSx, dangerBtnSx, successBtnSx } from "../../Comps/SomeAttrs";

function parseIntSafe(v) {
    const s = String(v ?? "").trim();
    if (!s) return NaN;
    const n = Number(s);
    return n;
}

export default function AdjustQuantityDialog({
    open,
    onClose,
    product, // { productId, productName, quantity }
    targetUserId, // المستخدم اللي هتزوّد/تنقص له (اللي ظاهر على الداشبورد)
    onAdjusted, // callback لتحديث UI بعد النجاح
}) {
    const showToast = useToast();

    const [mode, setMode] = useState("add"); // add | sub
    const [qty, setQty] = useState("");
    const [touched, setTouched] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const availableQty = Number(product?.quantity ?? 0);

    useEffect(() => {
        if (!open) return;
        setMode("add");
        setQty("");
        setTouched(false);
        setConfirmOpen(false);
        setSubmitting(false);
    }, [open, product?.productId]);

    const qtyValue = useMemo(() => parseIntSafe(qty), [qty]);

    const signedQty = useMemo(() => {
        if (!Number.isFinite(qtyValue)) return NaN;
        const q = Math.trunc(qtyValue);
        return mode === "sub" ? -Math.abs(q) : Math.abs(q);
    }, [qtyValue, mode]);

    const error = useMemo(() => {
        if (!touched) return "";

        if (!qty) return "أدخل الكمية";
        if (!Number.isFinite(qtyValue) || qtyValue <= 0)
            return "الكمية لازم تكون رقم أكبر من صفر";
        if (!Number.isInteger(qtyValue)) return "الكمية لازم تكون رقم صحيح";

        // لو تنقيص: متسمحش يقل عن 0 (حسب المتاح عند المستخدم)
        if (mode === "sub" && qtyValue > availableQty) {
            return `لا يمكن أن تتجاوز المتاح للتنقيص (${availableQty})`;
        }

        return "";
    }, [touched, qty, qtyValue, mode, availableQty]);

    const canSave = !error && !submitting;

    const openConfirm = (e) => {
        e.preventDefault();
        setTouched(true);
        if (!canSave) return;
        setConfirmOpen(true);
    };

    const doAdjust = async () => {
        const payload = {
            productId: Number(product.productId),
            userId: Number(targetUserId),
            qty: Number(signedQty), // ✅ موجب أو سالب
        };

        try {
            setSubmitting(true);
            await updateUserProductQuantity(payload);

            showToast({
                message:
                    mode === "add" ? "تم التزويد بنجاح" : "تم التنقيص بنجاح",
                icon:
                    mode === "add" ? (
                        <AddCircleOutlineIcon />
                    ) : (
                        <RemoveCircleOutlineIcon />
                    ),
                severity: "success",
                duration: 2000,
            });

            // ✅ حدث UI
            onAdjusted?.({
                productId: payload.productId,
                qtyDelta: payload.qty,
            });

            setConfirmOpen(false);
            onClose?.();
        } catch {
            showToast({
                message: "فشل تنفيذ العملية. حاول مرة أخرى.",
                icon:
                    mode === "add" ? (
                        <AddCircleOutlineIcon />
                    ) : (
                        <RemoveCircleOutlineIcon />
                    ),
                severity: "error",
                duration: 2500,
            });
            setConfirmOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    if (!product) return null;

    const confirmMsg =
        mode === "add"
            ? `هل تريد تزويد ${qtyValue || 0} من "${product.productName}" لهذا المستخدم؟`
            : `هل تريد تنقيص ${qtyValue || 0} من "${product.productName}" لهذا المستخدم؟`;

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
                            تزويد / تنقيص
                        </Typography>
                        <Typography
                            sx={{ color: "text.secondary", fontSize: 13 }}
                        >
                            {product.productName} — الحالي: {availableQty}
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
                            <FormControl disabled={submitting}>
                                <FormLabel
                                    sx={{ color: "text.secondary", mb: 1 }}
                                >
                                    نوع العملية
                                </FormLabel>

                                <RadioGroup
                                    row
                                    value={mode}
                                    onChange={(e) => {
                                        setMode(e.target.value);
                                        setTouched(true);
                                    }}
                                >
                                    <FormControlLabel
                                        value="add"
                                        control={<Radio />}
                                        label="تزويد"
                                    />
                                    <FormControlLabel
                                        value="sub"
                                        control={<Radio />}
                                        label="تنقيص"
                                    />
                                </RadioGroup>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="الكمية"
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
                                disabled={submitting}
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
                                    ) : mode === "add" ? (
                                        <AddCircleOutlineIcon />
                                    ) : (
                                        <RemoveCircleOutlineIcon />
                                    )
                                }
                                disabled={!canSave}
                                sx={mode === "add" ? successBtnSx : dangerBtnSx}
                            >
                                {submitting ? "جاري..." : "حفظ"}
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                title="تأكيد العملية"
                message={confirmMsg}
                icon={
                    mode === "add" ? (
                        <AddCircleOutlineIcon />
                    ) : (
                        <RemoveCircleOutlineIcon />
                    )
                }
                confirmText="تأكيد"
                cancelText="إلغاء"
                loading={submitting}
                danger={mode === "sub"} // التنقيص نخليه يميل للأحمر
                onClose={() => (submitting ? null : setConfirmOpen(false))}
                onConfirm={doAdjust}
            />
        </>
    );
}
