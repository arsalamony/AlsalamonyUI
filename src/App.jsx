import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import DashboardHome from "./pages/dashboard/DashboardHome";

import "./App.css";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CustomersList from "./pages/customers/CustomersList";
import CustomerCreate from "./pages/customers/CustomerCreate";
import CustomerEdit from "./pages/customers/CustomerEdit";
import { ConfirmDialogProvider } from "./providers/ConfirmDialogProvider";
import ToastProvider from "./providers/ToastProvider";
import CustomerInvoices from "./pages/customers/CustomerInvoices";
import InvoiceCreate from "./pages/invoices/InvoiceCreate";
import Payments from "./pages/payments/Payments";
import { isLoggedIn } from "./utils/authStorage";
import Records from "./pages/records/Records";
import Tasks from "./pages/tasks/Tasks";
import InvoiceDetailsPage from "./pages/invoices/InvoiceDetailsPage";
import IncomeReport from "./pages/reports/IncomeReport";
import AllPaymentsPage from "./pages/payments/AllPayments";

const darkTheme = createTheme({
    palette: {
        mode: "dark",

        background: {
            default: "#0f172a",
            // paper: "#1e293b",
            paper: "#0b1220",
        },

        primary: {
            main: "#38bdf8",
        },

        secondary: {
            main: "#7c3aed",
        },

        success: {
            main: "#16a34a",
        },

        error: {
            main: "#dc2626",
        },

        warning: {
            main: "#d97706",
        },

        info: {
            main: "#2563eb",
        },

        text: {
            primary: "#e5e7eb",
            secondary: "#9ca3af",
        },

        divider: "#334155",
    },

    shape: {
        borderRadius: 12,
    },

    typography: {
        fontFamily: "Cairo, Arial",
        h6: {
            fontWeight: 600,
        },
    },

    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 10,
                },
            },
        },
    },
});

function RequireAuth({ children }) {
    return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <ToastProvider>
                <ConfirmDialogProvider>
                    <Routes>
                        {/* صفحة اللوجين خارج الـ Layout */}
                        <Route path="/login" element={<Login />} />

                        {/* كل صفحات الداشبورد جوه Layout + حماية */}
                        <Route
                            element={
                                <RequireAuth>
                                    <DashboardLayout />
                                </RequireAuth>
                            }
                        >
                            <Route
                                path="/customers"
                                element={<CustomersList />}
                            />
                            <Route
                                path="/dashboard"
                                element={<DashboardHome />}
                            />
                            <Route
                                path="/customers/new"
                                element={<CustomerCreate />}
                            />
                            <Route
                                path="/customers/edit/:id"
                                element={<CustomerEdit />}
                            />
                            <Route
                                path="/customers/:customerId/invoices"
                                element={<CustomerInvoices />}
                            />
                            <Route
                                path="/invoices/new"
                                element={<InvoiceCreate />}
                            />
                            <Route
                                path="/customers/:customerId/invoices/new"
                                element={<InvoiceCreate />}
                            />
                            <Route path="/payments" element={<Payments />} />
                            <Route path="/Records" element={<Records />} />
                            <Route path="/Tasks" element={<Tasks />} />
                            <Route
                                path="/invoices/:invoiceId"
                                element={<InvoiceDetailsPage />}
                            />
                            <Route path="/Reports" element={<IncomeReport />} />
                            <Route path="/AllPayments" element={<AllPaymentsPage />} />
                        </Route>

                        {/* default */}
                        <Route
                            path="/"
                            element={<Navigate to="/dashboard" replace />}
                        />

                        {/* 404 */}
                        <Route
                            path="*"
                            element={<Navigate to="/dashboard" replace />}
                        />
                    </Routes>
                </ConfirmDialogProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
