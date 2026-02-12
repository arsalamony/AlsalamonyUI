import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import NotesIcon from "@mui/icons-material/Notes";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useToast } from "../hooks/useToast";
import { fix2, formatMoney } from "../utils/Methods";

import { useProducts } from "../hooks/useProducts";
import { usePaymentMethods } from "../hooks/usePaymentMethods";

import { getErrorMessage } from "../api/apiError";
import { addInvoice } from "../api/Invoice.api";
import {
    btnOutlineSx,
    cardSx,
    selectSx,
    inputSx,
    btnSaveSx,
} from "../Comps/SomeAttrs";
import { getCustomerById } from "../api/customer.api"; // عدّل المسار حسب عندك

export default function InvoiceCreate() {
    const navigate = useNavigate();
    const showToast = useToast();

    const { customerId } = useParams();
    const isAnonymous = !customerId;

    const [customer, setCustomer] = useState(null);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerError, setCustomerError] = useState("");

    const {
        products,
        loading: productsLoading,
        error: productsError,
        refresh,
    } = useProducts();
    const { paymentMethods } = usePaymentMethods();

    // ===== Helpers =====
    const toNumber = (v) => {
        // يدعم 100,5 -> 100.5
        const s = String(v ?? "")
            .trim()
            .replace(",", ".");
        const n = Number(s);
        return Number.isFinite(n) ? n : NaN;
    };

    // ===== State =====
    const [items, setItems] = useState([]);

    const [totalAmount, setTotalAmount] = useState("0");
    const [amountPaid, setAmountPaid] = useState("0");

    const [paymentMethod, setPaymentMethod] = useState(""); // هنظبطها بالـ effect
    const [notes, setNotes] = useState("");

    const [submitting, setSubmitting] = useState(false);

    // ✅ اضبط paymentMethod أول ما paymentMethods تيجي
    useEffect(() => {
        if (paymentMethod) return;
        const first = paymentMethods?.[0]?.value;
        if (first != null) setPaymentMethod(String(first));
    }, [paymentMethods, paymentMethod]);

    const computedItemsTotal = useMemo(() => {
        return items.reduce((sum, it) => {
            const qty = toNumber(it.qty ?? 0);
            const price = toNumber(it.pricePerUnit ?? 0);

            if (it.isGift) return sum;
            if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum;

            return sum + qty * price;
        }, 0);
    }, [items]);

    useEffect(() => {
        if (isAnonymous) {
            setCustomer(null);
            setCustomerError("");
            setCustomerLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                setCustomerLoading(true);
                setCustomerError("");

                const data = await getCustomerById(Number(customerId));
                if (cancelled) return;

                setCustomer(data);
            } catch (err) {
                if (cancelled) return;
                setCustomer(null);
                setCustomerError(getErrorMessage(err));
            } finally {
                if (!cancelled) setCustomerLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [customerId, isAnonymous]);

    const fillTotalFromItems = () => {
        setTotalAmount(fix2(computedItemsTotal));
    };

    const fillPaidFull = () => {
        const t = toNumber(totalAmount);
        if (Number.isFinite(t)) {
            setAmountPaid(String(t));
            return;
        }
        // fallback لو الإجمالي مش رقم: خده من المحسوب
        setAmountPaid(fix2(computedItemsTotal));
    };

    // ===== Validation =====
    const errors = useMemo(() => {
        const e = {};

        const t = toNumber(totalAmount);
        const p = toNumber(amountPaid);

        if (!Number.isFinite(t) || t < 0)
            e.totalAmount = "الإجمالي لازم يكون رقم 0 أو أكبر";
        if (!Number.isFinite(p) || p < 0)
            e.amountPaid = "المدفوع لازم يكون رقم 0 أو أكبر";

        // لو مفيش items يبقى لازم إجمالي > 0 (دين/خدمة)
        if (items.length === 0) {
            if (!Number.isFinite(t) || t <= 0)
                e.totalAmount = "لو مفيش منتجات لازم تكتب إجمالي أكبر من صفر";
        }

        // مجهول: لازم يدفع كامل
        if (isAnonymous) {
            if (Number.isFinite(t) && Number.isFinite(p)) {
                if (Math.abs(p - t) > 0.01)
                    e.amountPaid = "للمجهول لازم يكون المدفوع = الإجمالي";
            }
        } else {
            // عميل: جزئي مسموح لكن لا يتجاوز الإجمالي
            if (Number.isFinite(t) && Number.isFinite(p) && p - t > 0.01) {
                e.amountPaid = "المدفوع لا يمكن أن يتجاوز الإجمالي";
            }
        }

        // items validation
        for (const it of items) {
            if (!it.productId) {
                e.items = "يوجد عنصر بدون منتج";
                break;
            }
            const qty = toNumber(it.qty);
            const price = toNumber(it.pricePerUnit);

            if (!Number.isFinite(qty) || qty <= 0) {
                e.items = "الكمية لازم تكون رقم أكبر من صفر";
                break;
            }
            if (!Number.isFinite(price) || price < 0) {
                e.items = "سعر الوحدة لازم يكون رقم 0 أو أكبر";
                break;
            }
        }

        if (!paymentMethod) {
            e.paymentMethod = "اختر طريقة الدفع";
        }

        return e;
    }, [totalAmount, amountPaid, isAnonymous, items, paymentMethod]);

    const isValid = Object.keys(errors).length === 0;

    // ===== Items helpers =====
    const addItemRow = () => {
        const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
        setItems((prev) => [
            ...prev,
            {
                id,
                productId: "",
                qty: 1,
                pricePerUnit: 0,
                isGift: false,
                lastPrice: 0,
            },
        ]);
    };

    const removeItemRow = (id) =>
        setItems((prev) => prev.filter((x) => x.id !== id));

    const updateItem = (id, patch) =>
        setItems((prev) =>
            prev.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        );

    const onSelectProduct = (id, productIdStr) => {
        const pid = Number(productIdStr);
        const p = products.find((x) => Number(x.productId) === pid);
        if (!p) return;

        updateItem(id, {
            productId: pid,
            qty: 1,
            pricePerUnit: p.price,
            lastPrice: p.price,
            isGift: false,
        });
    };

    const toggleGift = (id, checked) => {
        const it = items.find((x) => x.id === id);
        if (!it) return;

        if (checked) {
            updateItem(id, {
                isGift: true,
                lastPrice: toNumber(it.pricePerUnit) || it.lastPrice || 0,
                pricePerUnit: 0,
            });
        } else {
            updateItem(id, { isGift: false, pricePerUnit: it.lastPrice || 0 });
        }
    };

    // ===== Submit (API) =====
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid) {
            showToast({
                message:
                    errors.items ||
                    errors.totalAmount ||
                    errors.amountPaid ||
                    errors.paymentMethod ||
                    "راجع البيانات",
                icon: <PaymentsIcon />,
                severity: "error",
                duration: 2000,
            });
            return;
        }

        const payload = {
            customerId: isAnonymous ? null : Number(customerId),
            totalAmount: toNumber(totalAmount),
            amountPaid: toNumber(amountPaid),
            paymentMethod: Number(paymentMethod),
            notes: notes.trim() ? notes.trim() : null,
            invoiceItems: items.map((it) => ({
                productId: Number(it.productId),
                qty: toNumber(it.qty),
                pricePerUnit: toNumber(it.pricePerUnit),
                isGift: Boolean(it.isGift),
            })),
        };

        try {
            setSubmitting(true);

            await addInvoice(payload);

            showToast({
                message: "تم إنشاء الفاتورة بنجاح",
                icon: <CheckCircleIcon />,
                severity: "success",
                duration: 2000,
            });

            navigate(
                isAnonymous
                    ? "/customers"
                    : `/customers/${customerId}/invoices`,
            );
        } catch (err) {
            showToast({
                message: getErrorMessage(err),
                icon: <PaymentsIcon />,
                severity: "error",
                duration: 2500,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ direction: "rtl" }}>
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ mb: 2 }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #38bdf8, #22d3ee)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    إضافة فاتورة
                </Typography>

                <Chip
                    label={
                        isAnonymous
                            ? "مجهول (دفع كامل فقط)"
                            : customerLoading
                              ? "جاري تحميل بيانات العميل..."
                              : customerError
                                ? `العميل: #${customerId}`
                                : `العميل: ${customer?.name ?? `#${customerId}`}`
                    }
                    sx={{
                        ml: 1,
                        bgcolor: isAnonymous
                            ? "rgba(245,158,11,0.12)"
                            : "rgba(56,189,248,0.12)",
                        border: isAnonymous
                            ? "1px solid rgba(245,158,11,0.30)"
                            : "1px solid rgba(56,189,248,0.25)",
                        color: "#e5e7eb",
                        fontWeight: 800,
                    }}
                />

                <Box sx={{ flex: 1 }} />

                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={btnOutlineSx}
                >
                    رجوع
                </Button>
            </Stack>

            <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {/* ===== Items Section ===== */}
                            <Grid size={{ xs: 12 }}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ mb: 1 }}
                                >
                                    <Typography sx={{ fontWeight: 900 }}>
                                        بنود الفاتورة (اختياري)
                                    </Typography>
                                    <Box sx={{ flex: 1 }} />

                                    <Button
                                        type="button"
                                        startIcon={<AddIcon />}
                                        onClick={addItemRow}
                                        variant="outlined"
                                        sx={btnOutlineSx}
                                        disabled={productsLoading || submitting}
                                    >
                                        إضافة منتج
                                    </Button>
                                </Stack>

                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                        fontSize: 12,
                                        mb: 1.5,
                                    }}
                                >
                                    * يمكن ترك البنود فارغة وكتابة ملاحظات فقط
                                    (دين/خدمة).
                                </Typography>

                                {productsLoading && (
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ mb: 1 }}
                                    >
                                        <CircularProgress size={18} />
                                        <Typography
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 12,
                                            }}
                                        >
                                            جاري تحميل المنتجات...
                                        </Typography>
                                    </Stack>
                                )}

                                {productsError && (
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ mb: 1 }}
                                    >
                                        <Typography
                                            sx={{
                                                color: "error.main",
                                                fontSize: 12,
                                            }}
                                        >
                                            فشل تحميل المنتجات
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={refresh}
                                            sx={btnOutlineSx}
                                        >
                                            إعادة المحاولة
                                        </Button>
                                    </Stack>
                                )}

                                {errors.items ? (
                                    <Typography
                                        sx={{
                                            color: "error.main",
                                            mb: 1,
                                            fontSize: 12,
                                        }}
                                    >
                                        {errors.items}
                                    </Typography>
                                ) : null}

                                <Stack spacing={1.5}>
                                    {items.map((it) => (
                                        <Card
                                            key={it.id}
                                            sx={{
                                                bgcolor:
                                                    "rgba(148,163,184,0.05)",
                                                border: "1px solid rgba(148,163,184,0.14)",
                                                borderRadius: 2,
                                                boxShadow: "none",
                                            }}
                                        >
                                            <CardContent sx={{ p: 2 }}>
                                                <Grid
                                                    container
                                                    spacing={1.5}
                                                    alignItems="center"
                                                >
                                                    {/* Product */}
                                                    <Grid
                                                        size={{ xs: 12, md: 4 }}
                                                    >
                                                        <FormControl
                                                            fullWidth
                                                            sx={selectSx}
                                                        >
                                                            <InputLabel>
                                                                المنتج
                                                            </InputLabel>
                                                            <Select
                                                                label="المنتج"
                                                                value={
                                                                    it.productId
                                                                        ? String(
                                                                              it.productId,
                                                                          )
                                                                        : ""
                                                                }
                                                                onChange={(e) =>
                                                                    onSelectProduct(
                                                                        it.id,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                startAdornment={
                                                                    <InputAdornment position="start">
                                                                        <ShoppingCartIcon
                                                                            sx={{
                                                                                color: "text.secondary",
                                                                                mr: 1,
                                                                            }}
                                                                        />
                                                                    </InputAdornment>
                                                                }
                                                                disabled={
                                                                    productsLoading ||
                                                                    submitting
                                                                }
                                                            >
                                                                {productsLoading &&
                                                                products.length ===
                                                                    0 ? (
                                                                    <MenuItem
                                                                        value=""
                                                                        disabled
                                                                    >
                                                                        جاري
                                                                        التحميل...
                                                                    </MenuItem>
                                                                ) : null}

                                                                {products.map(
                                                                    (p) => (
                                                                        <MenuItem
                                                                            key={
                                                                                p.productId
                                                                            }
                                                                            value={String(
                                                                                p.productId,
                                                                            )}
                                                                        >
                                                                            {
                                                                                p.productName
                                                                            }{" "}
                                                                            —{" "}
                                                                            {formatMoney(
                                                                                p.price,
                                                                            )}
                                                                        </MenuItem>
                                                                    ),
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>

                                                    {/* Qty */}
                                                    <Grid
                                                        size={{ xs: 6, md: 2 }}
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            label="الكمية"
                                                            value={it.qty}
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    it.id,
                                                                    {
                                                                        qty: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                )
                                                            }
                                                            inputProps={{
                                                                inputMode:
                                                                    "numeric",
                                                            }}
                                                            sx={inputSx}
                                                            disabled={
                                                                submitting
                                                            }
                                                        />
                                                    </Grid>

                                                    {/* PricePerUnit */}
                                                    <Grid
                                                        size={{ xs: 6, md: 3 }}
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            label="سعر الوحدة"
                                                            value={
                                                                it.pricePerUnit
                                                            }
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    it.id,
                                                                    {
                                                                        pricePerUnit:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        lastPrice:
                                                                            it.isGift
                                                                                ? it.lastPrice
                                                                                : toNumber(
                                                                                      e
                                                                                          .target
                                                                                          .value,
                                                                                  ) ||
                                                                                  it.lastPrice,
                                                                    },
                                                                )
                                                            }
                                                            inputProps={{
                                                                inputMode:
                                                                    "decimal",
                                                            }}
                                                            sx={inputSx}
                                                            disabled={
                                                                submitting
                                                            }
                                                        />
                                                    </Grid>

                                                    {/* Gift */}
                                                    <Grid
                                                        size={{ xs: 12, md: 2 }}
                                                    >
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={Boolean(
                                                                        it.isGift,
                                                                    )}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        toggleGift(
                                                                            it.id,
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        submitting
                                                                    }
                                                                />
                                                            }
                                                            label="هدية"
                                                        />
                                                    </Grid>

                                                    {/* Remove */}
                                                    <Grid
                                                        size={{ xs: 12, md: 1 }}
                                                    >
                                                        <IconButton
                                                            onClick={() =>
                                                                removeItemRow(
                                                                    it.id,
                                                                )
                                                            }
                                                            disabled={
                                                                submitting
                                                            }
                                                            sx={{
                                                                color: "#ef4444",
                                                                bgcolor:
                                                                    "rgba(239,68,68,0.10)",
                                                                border: "1px solid rgba(239,68,68,0.20)",
                                                                "&:hover": {
                                                                    bgcolor:
                                                                        "rgba(239,68,68,0.18)",
                                                                },
                                                            }}
                                                        >
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    </Grid>

                                                    {/* Line total info */}
                                                    <Grid size={{ xs: 12 }}>
                                                        <Typography
                                                            sx={{
                                                                color: "text.secondary",
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            الإجمالي المحسوب
                                                            للبند:{" "}
                                                            <span
                                                                style={{
                                                                    color: "#e5e7eb",
                                                                    fontWeight: 800,
                                                                }}
                                                            >
                                                                {it.isGift
                                                                    ? formatMoney(
                                                                          0,
                                                                      )
                                                                    : formatMoney(
                                                                          toNumber(
                                                                              it.qty ||
                                                                                  0,
                                                                          ) *
                                                                              toNumber(
                                                                                  it.pricePerUnit ||
                                                                                      0,
                                                                              ),
                                                                      )}
                                                            </span>
                                                            {it.isGift
                                                                ? " (هدية)"
                                                                : ""}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {items.length === 0 ? (
                                        <Typography
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 12,
                                            }}
                                        >
                                            لا توجد منتجات مضافة.
                                        </Typography>
                                    ) : null}
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider
                                    sx={{ my: 1.5, borderColor: "#1e293b" }}
                                />
                            </Grid>

                            {/* ===== Totals Section ===== */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="إجمالي المنتجات (محسوب)"
                                    value={fix2(computedItemsTotal)}
                                    disabled
                                    sx={inputSx}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                >
                                    <TextField
                                        fullWidth
                                        label="الإجمالي النهائي (يدوي)"
                                        value={totalAmount}
                                        onChange={(e) =>
                                            setTotalAmount(e.target.value)
                                        }
                                        error={Boolean(errors.totalAmount)}
                                        helperText={errors.totalAmount || " "}
                                        inputProps={{ inputMode: "decimal" }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <ReceiptLongIcon
                                                        sx={{
                                                            color: "text.secondary",
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputSx}
                                        disabled={submitting}
                                    />

                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={fillTotalFromItems}
                                        sx={{
                                            ...btnOutlineSx,
                                            minWidth: { xs: "100%", sm: 180 },
                                            height: { sm: 56 },
                                        }}
                                        disabled={submitting}
                                    >
                                        استخدم المحسوب
                                    </Button>
                                </Stack>
                            </Grid>

                            {/* ===== AmountPaid + PaymentMethod ===== */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                >
                                    <TextField
                                        fullWidth
                                        label="المدفوع"
                                        value={amountPaid}
                                        onChange={(e) =>
                                            setAmountPaid(e.target.value)
                                        }
                                        error={Boolean(errors.amountPaid)}
                                        helperText={errors.amountPaid || " "}
                                        inputProps={{ inputMode: "decimal" }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocalAtmIcon
                                                        sx={{
                                                            color: "text.secondary",
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputSx}
                                        disabled={submitting}
                                    />

                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={fillPaidFull}
                                        sx={{
                                            ...btnOutlineSx,
                                            minWidth: { xs: "100%", sm: 180 },
                                            height: { sm: 56 },
                                        }}
                                        disabled={submitting}
                                    >
                                        دفع كامل
                                    </Button>
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    sx={selectSx}
                                    error={Boolean(errors.paymentMethod)}
                                >
                                    <InputLabel>طريقة الدفع</InputLabel>
                                    <Select
                                        label="طريقة الدفع"
                                        value={paymentMethod}
                                        onChange={(e) =>
                                            setPaymentMethod(e.target.value)
                                        }
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <PaymentsIcon
                                                    sx={{
                                                        color: "text.secondary",
                                                        mr: 1,
                                                    }}
                                                />
                                            </InputAdornment>
                                        }
                                        disabled={submitting}
                                    >
                                        {paymentMethods.map((m) => (
                                            <MenuItem
                                                key={m.value}
                                                value={String(m.value)}
                                            >
                                                {m.label}
                                            </MenuItem>
                                        ))}
                                    </Select>

                                    {errors.paymentMethod ? (
                                        <Typography
                                            sx={{
                                                mt: 0.5,
                                                fontSize: 12,
                                                color: "error.main",
                                                minHeight: 18,
                                            }}
                                        >
                                            {errors.paymentMethod}
                                        </Typography>
                                    ) : (
                                        <Typography
                                            sx={{
                                                mt: 0.5,
                                                fontSize: 12,
                                                color: "transparent",
                                                minHeight: 18,
                                            }}
                                        >
                                            .
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            {/* ===== Notes ===== */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="ملاحظات (اختياري)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    multiline
                                    minRows={3}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <NotesIcon
                                                    sx={{
                                                        color: "text.secondary",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputSx}
                                    disabled={submitting}
                                />
                            </Grid>

                            {/* ===== Submit ===== */}
                            <Grid size={{ xs: 12 }}>
                                <Divider
                                    sx={{ my: 1.5, borderColor: "#1e293b" }}
                                />

                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    justifyContent="flex-end"
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(-1)}
                                        sx={btnOutlineSx}
                                        disabled={submitting}
                                    >
                                        إلغاء
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<ReceiptLongIcon />}
                                        disabled={!isValid || submitting}
                                        sx={btnSaveSx}
                                    >
                                        {submitting
                                            ? "جاري الحفظ..."
                                            : "إنشاء فاتورة"}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
