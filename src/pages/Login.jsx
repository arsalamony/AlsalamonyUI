import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    Typography,
    TextField,
    FormControlLabel,
    Checkbox,
    Button,
} from "@mui/material";
import { useToast } from "../hooks/useToast";
import { isLoggedIn, saveAuth } from "../utils/authStorage";
import { loginApi } from "../api/auth.api";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import { getErrorMessage } from "../api/apiError";

export default function Login() {
    const navigate = useNavigate();
    const showToast = useToast();

    const [form, setForm] = useState({
        username: "",
        password: "",
        remember: false,
    });

    useEffect(() => {
        if (isLoggedIn()) navigate("/dashboard", { replace: true });
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("login");
        try {
            // setLoading(true);

            // ✅ LoginRequest مطابق للـ C#
            const res = await loginApi({
                username: form.username,
                password: form.password,
            });

            // ✅ res هو AuthResponse
            saveAuth(res);

            showToast({
                message: `أهلاً ${res.Name ?? res.name}`,
                icon: <CheckCircle />,
                severity: "success",
                duration: 2000,
            });

            navigate("/dashboard", { replace: true });
        } catch (err) {
            const msg =
                getErrorMessage(err) ??
                "فشل تسجيل الدخول";

            showToast({
                message: msg,
                icon: <ErrorOutline />,
                severity: "error",
                duration: 2000,
            });
        } finally {
            // setLoading(false);
        }
    };

    return (
        <Box
            dir="rtl"
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                background:
                    "radial-gradient(1200px 600px at 50% 20%, #2b3c55 0%, #1a2433 55%, #131b26 100%)",
            }}
        >
            <Typography
                sx={{
                    fontSize: { xs: 44, md: 64 },
                    fontWeight: 800,
                    mb: 4,
                    letterSpacing: 1,
                    background: "linear-gradient(90deg, #38bdf8, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                السلاموني
            </Typography>

            <Card
                elevation={0}
                sx={{
                    width: "min(520px, 92vw)",
                    borderRadius: 3,
                    p: { xs: 3, md: 4 },

                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.2,
                    }}
                >
                    <TextField
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="اسم المستخدم"
                        fullWidth
                        InputProps={{
                            sx: {
                                borderRadius: 2,
                                color: "#dbe4f1",
                                backgroundColor: "rgba(255,255,255,0.03)",
                            },
                        }}
                    />

                    <TextField
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="كلمة السر"
                        fullWidth
                        InputProps={{
                            sx: {
                                borderRadius: 2,
                                color: "#dbe4f1",
                                backgroundColor: "rgba(255,255,255,0.03)",
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(255,255,255,0.15)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(255,255,255,0.25)",
                            },
                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                    borderColor: "rgba(64, 173, 255, 0.8)",
                                },
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                        }}
                    >
                        <FormControlLabel
                            sx={{
                                m: 0,
                                color: "#c9d6e8",
                                "& .MuiTypography-root": {
                                    fontSize: 14,
                                },
                            }}
                            label="تذكرني ؟"
                            control={
                                <Checkbox
                                    name="remember"
                                    checked={form.remember}
                                    onChange={handleChange}
                                    sx={{
                                        color: "rgba(255,255,255,0.5)",
                                        "&.Mui-checked": {
                                            color: "#40adff",
                                        },
                                    }}
                                />
                            }
                        />
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 1,
                            py: 1.3,
                            borderRadius: 2,
                            fontWeight: 600,
                        }}
                    >
                        تسجيل الدخول
                    </Button>
                </Box>
            </Card>
        </Box>
    );
}
