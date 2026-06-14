import { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

// import { useAddresses } from "../../hooks/useAddresses";

// ✅ 6 عناوين ثابتة
const STATIC_ADDRESSES = [
    { addressId: 1, addressName: "بني عدي" },
    { addressId: 2, addressName: "العزيه" },
    { addressId: 3, addressName: "العتامنه" },
    { addressId: 4, addressName: "بني سند" },
    { addressId: 5, addressName: "المندره" },
    { addressId: 6, addressName: "عزبة عبد الباقي" },
];

export default function CustomerForm({ title, initialValues, onSubmit }) {
    const navigate = useNavigate();
    const  addresses  = STATIC_ADDRESSES;

    // ✅ important: init once (component mounts after initialValues is ready)
    const [form, setForm] = useState(() => ({
        name: initialValues?.name ?? "",
        phone: initialValues?.phone ?? "",
        addressId:
            initialValues?.addressId != null
                ? String(initialValues.addressId)
                : "",
    }));

    const [touched, setTouched] = useState({
        name: false,
        phone: false,
        addressId: false,
    });

    const errors = useMemo(() => {
        const e = {};

        if (!form.name.trim()) e.name = "اسم العميل مطلوب";

        const phone = form.phone.trim();
        if (!phone) e.phone = "رقم الهاتف مطلوب";
        else if (!/^01\d{9}$/.test(phone))
            e.phone = "رقم الهاتف غير صحيح (مثال: 011xxxxxxxx)";

        if (!form.addressId) e.addressId = "اختر العنوان";

        return e;
    }, [form]);

    const isValid = Object.keys(errors).length === 0;

    const handleChange = (key) => (e) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ name: true, phone: true, addressId: true });

        if (!isValid) return;

        const payload = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            addressId: Number(form.addressId),
        };

        await onSubmit?.(payload);
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
                    {title}
                </Typography>

                <Box sx={{ flex: 1 }} />

                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/customers")}
                    sx={btnOutlineSx}
                >
                    رجوع
                </Button>
            </Stack>

            <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        بيانات العميل
                    </Typography>
                    <Typography
                        sx={{ color: "text.secondary", fontSize: 13, mb: 2 }}
                    >
                        املأ البيانات ثم اضغط حفظ
                    </Typography>

                    <Divider sx={{ mb: 2, borderColor: "#1e293b" }} />

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {/* Name */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="اسم العميل"
                                    value={form.name}
                                    onChange={handleChange("name")}
                                    onBlur={() =>
                                        setTouched((p) => ({
                                            ...p,
                                            name: true,
                                        }))
                                    }
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={
                                        touched.name ? errors.name : " "
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon
                                                    sx={{
                                                        color: "text.secondary",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputSx}
                                />
                            </Grid>

                            {/* Phone */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="رقم الهاتف"
                                    value={form.phone}
                                    onChange={handleChange("phone")}
                                    onBlur={() =>
                                        setTouched((p) => ({
                                            ...p,
                                            phone: true,
                                        }))
                                    }
                                    error={
                                        touched.phone && Boolean(errors.phone)
                                    }
                                    helperText={
                                        touched.phone ? errors.phone : " "
                                    }
                                    inputProps={{ inputMode: "numeric" }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneAndroidIcon
                                                    sx={{
                                                        color: "text.secondary",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputSx}
                                />
                            </Grid>

                            {/* Address */}
                            <Grid size={{ xs: 12 }}>
                                <FormControl
                                    fullWidth
                                    sx={selectSx}
                                    error={
                                        touched.addressId &&
                                        Boolean(errors.addressId)
                                    }
                                >
                                    <InputLabel>العنوان</InputLabel>

                                    <Select
                                        label="العنوان"
                                        value={Number(form.addressId)}
                                        onChange={handleChange("addressId")}
                                        onBlur={() =>
                                            setTouched((p) => ({
                                                ...p,
                                                addressId: true,
                                            }))
                                        }
                                    >
                                        <MenuItem value="">
                                            <em>اختر العنوان</em>
                                        </MenuItem>

                                        {addresses.map((a) => (
                                            <MenuItem
                                                key={a.addressId}
                                                value={a.addressId}
                                            >
                                                {a.addressName}
                                            </MenuItem>
                                        ))}
                                    </Select>

                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            fontSize: 12,
                                            color: "error.main",
                                            minHeight: 18,
                                        }}
                                    >
                                        {touched.addressId
                                            ? errors.addressId
                                            : " "}
                                    </Typography>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2, borderColor: "#1e293b" }} />

                        <Stack
                            direction="row"
                            spacing={1.5}
                            justifyContent="flex-end"
                        >
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/customers")}
                                sx={btnOutlineSx}
                            >
                                إلغاء
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={!isValid}
                                sx={btnSaveSx}
                            >
                                حفظ
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

/* ===== styles ===== */

const cardSx = {
    bgcolor: "#0b1220",
    border: "1px solid #1e293b",
    borderRadius: 3,
    boxShadow: "none",
};

const inputSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(148,163,184,0.06)",
        borderRadius: 2,
    },
    "& .MuiInputLabel-root": {
        color: "rgba(229,231,235,0.7)",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(148,163,184,0.22)",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(56,189,248,0.35)",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(56,189,248,0.55)",
    },
};

const selectSx = { ...inputSx };

const btnOutlineSx = {
    borderColor: "rgba(148,163,184,0.25)",
    color: "#e5e7eb",
    borderRadius: 2,
    "&:hover": { borderColor: "rgba(56,189,248,0.35)" },
};

const btnSaveSx = {
    borderRadius: 2,
    fontWeight: 700,
    bgcolor: "rgba(56,189,248,0.18)",
    border: "1px solid rgba(56,189,248,0.30)",
    color: "#e5e7eb",
    "&:hover": { bgcolor: "rgba(56,189,248,0.26)" },
    "&.Mui-disabled": {
        opacity: 0.5,
        color: "#e5e7eb",
        bgcolor: "rgba(148,163,184,0.10)",
        border: "1px solid rgba(148,163,184,0.18)",
    },
};
