import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
    AppBar,
    Box,
    Collapse,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import InsightsIcon from "@mui/icons-material/Insights";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import {
    Add,
    ExpandLess,
    ExpandMore,
    FiberManualRecord,
    HomeFilled,
    ListAlt,
    Logout,
    Notes,
    PeopleAlt,
    PersonAddAlt,
    Task,
} from "@mui/icons-material";
import { logout } from "../utils/authStorage";
import { ProductsProvider } from "../providers/ProductsProvider";
import { AddressesProvider } from "../providers/AddressesProvider";
import { PaymentMethodsProvider } from "../providers/PaymentMethodsProvider";
import { UsersProvider } from "../providers/UsersProvider";
import { UserLocationProvider } from "../providers/UserLocationProvider";

const DRAWER_WIDTH = 280;

const navItems = [
    { label: "الرئيسية", to: "/dashboard", icon: <HomeFilled /> },
    {
        label: "العملاء",
        icon: <PeopleAlt />,
        children: [
            { label: "عرض العملاء", to: "/customers", icon: <ListAlt /> },
            {
                label: "إضافة عميل",
                to: "/customers/new",
                icon: <PersonAddAlt />,
            },
        ],
    },
    {
        label: "إضافة فاتورة لمجهول",
        to: "/invoices/new",
        icon: <ReceiptLongIcon />,
    },
    { label: "الدفعات والحساب", to: "/payments", icon: <PaymentsIcon /> },
    { label: "التسجيلات", to: "/Records", icon: <Notes /> },
    { label: "المهمام", to: "/Tasks", icon: <Task /> },
    { label: "التقارير", to: "/Reports", icon: <InsightsIcon /> },
    { label: "All Payments", to: "/AllPayments", icon: <PaidOutlinedIcon /> },
];

export default function DashboardLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [collapsed, setCollapsed] = useState(false); // للـ desktop
    const [mobileOpen, setMobileOpen] = useState(false); // للموبايل

    const drawerWidth = collapsed ? 0 : DRAWER_WIDTH;

    const handleMenuClick = () => {
        if (isMobile) setMobileOpen((p) => !p);
        else setCollapsed((p) => !p);
    };

    return (
        <AddressesProvider>
            <PaymentMethodsProvider>
                <ProductsProvider>
                    <UsersProvider>
                        <UserLocationProvider>
                            {/* ✅ مهم جداً: امنع سكرول الصفحة أفقيًا وخلي السكرول جوه الجدول فقط */}
                            <Box
                                sx={{
                                    display: "flex",
                                    direction: "rtl",
                                    width: "100%",
                                    overflowX: "hidden",
                                }}
                            >
                                <CssBaseline />

                                <AppBar
                                    position="fixed"
                                    sx={{
                                        bgcolor: "#0b1220",
                                        borderBottom: "1px solid #1e293b",
                                        zIndex: (t) => t.zIndex.drawer + 1,
                                    }}
                                >
                                    <Toolbar sx={{ gap: 1 }}>
                                        <IconButton
                                            onClick={handleMenuClick}
                                            sx={{ color: "text.primary" }}
                                            edge="start"
                                        >
                                            <MenuIcon />
                                        </IconButton>

                                        <Box sx={{ flex: 1 }} />

                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: 18,
                                                background:
                                                    "linear-gradient(90deg, #38bdf8, #22d3ee)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor:
                                                    "transparent",
                                            }}
                                        >
                                            السلاموني
                                        </Typography>
                                    </Toolbar>
                                </AppBar>

                                {/* ✅ Drawer: على الموبايل Temporary (Overlay)، على الديسكتوب Permanent */}
                                <Drawer
                                    variant={
                                        isMobile ? "temporary" : "permanent"
                                    }
                                    open={isMobile ? mobileOpen : true}
                                    onClose={() => setMobileOpen(false)}
                                    anchor="right"
                                    ModalProps={{ keepMounted: true }} // أداء أفضل على الموبايل
                                    sx={{
                                        width: isMobile
                                            ? DRAWER_WIDTH
                                            : drawerWidth,
                                        flexShrink: 0,
                                        "& .MuiDrawer-paper": {
                                            width: isMobile
                                                ? DRAWER_WIDTH
                                                : drawerWidth,
                                            boxSizing: "border-box",
                                            bgcolor: "#0b1220",
                                            borderLeft: "1px solid #1e293b",
                                            overflow: "hidden",
                                            transition: "width 200ms ease",
                                            height: "100vh",
                                            display: "flex",
                                            flexDirection: "column",
                                        },
                                    }}
                                >
                                    <Toolbar />

                                    <Box
                                        sx={{
                                            px: 1,
                                            flex: 1,
                                            overflowY: "auto",
                                            overflowX: "hidden",
                                            pb: 1,
                                            direction: "ltr",
                                            "&::-webkit-scrollbar": {
                                                width: "5px",
                                            },
                                            "&::-webkit-scrollbar-track": {
                                                background: "transparent",
                                            },
                                            "&::-webkit-scrollbar-thumb": {
                                                backgroundColor:
                                                    "rgba(148,163,184,0.28)",
                                                borderRadius: "10px",
                                            },
                                            "&::-webkit-scrollbar-thumb:hover":
                                                {
                                                    backgroundColor:
                                                        "rgba(148,163,184,0.45)",
                                                },
                                            scrollbarWidth: "thin",
                                            scrollbarColor:
                                                "rgba(148,163,184,0.28) transparent",
                                        }}
                                    >
                                        <SidebarMenu
                                            navItems={navItems}
                                            collapsed={
                                                isMobile ? false : collapsed
                                            }
                                            onNavigate={() =>
                                                isMobile && setMobileOpen(false)
                                            }
                                        />

                                        <ListItemButton
                                            component={NavLink}
                                            onClick={() => {
                                                logout();
                                                if (isMobile)
                                                    setMobileOpen(false);
                                            }}
                                            to={"/login"}
                                            sx={{
                                                borderRadius: 2,
                                                mx: 1,
                                                my: 0.5,
                                                "&.active": {
                                                    bgcolor:
                                                        "rgba(56,189,248,0.12)",
                                                    border: "1px solid rgba(56,189,248,0.25)",
                                                },
                                                "&:hover": {
                                                    bgcolor:
                                                        "rgba(148,163,184,0.10)",
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    ml: 1.5,
                                                    color: "text.primary",
                                                    justifyContent: "center",
                                                    width: 36,
                                                }}
                                            >
                                                <Logout />
                                            </ListItemIcon>

                                            <ListItemText
                                                primary="تسجيل الخروج"
                                                sx={{
                                                    opacity: (
                                                        isMobile
                                                            ? false
                                                            : collapsed
                                                    )
                                                        ? 0
                                                        : 1,
                                                    transition:
                                                        "opacity 150ms ease",
                                                    whiteSpace: "nowrap",
                                                }}
                                            />
                                        </ListItemButton>
                                    </Box>
                                </Drawer>

                                {/* ✅ Main Content */}
                                <Box
                                    component="main"
                                    sx={{
                                        flexGrow: 1,
                                        width: "100%",
                                        minHeight: "100vh",

                                        // ✅ أهم سطرين لحل مشكلة الـ overflow داخل flex
                                        minWidth: 0, // يسمح للـ Outlet ينكمش بدل ما يوسّع الصفحة
                                        overflowX: "hidden", // امنع سكرول الصفحة - وخلي سكرول الجدول داخلي

                                        bgcolor: "#0f172a",
                                        p: { xs: 2, sm: 3 },
                                    }}
                                >
                                    <Toolbar />
                                    <Outlet />
                                </Box>
                            </Box>
                        </UserLocationProvider>
                    </UsersProvider>
                </ProductsProvider>
            </PaymentMethodsProvider>
        </AddressesProvider>
    );
}

function SidebarMenu({ navItems, collapsed, onNavigate }) {
    const [openMap, setOpenMap] = useState({});

    const toggleGroup = (key) =>
        setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <List sx={{ pt: 1, direction: "rtl" }}>
            {navItems.map((item, idx) => {
                const hasChildren =
                    Array.isArray(item.children) && item.children.length > 0;
                const groupKey = item.to || item.label || String(idx);
                const isOpen = !!openMap[groupKey];

                if (!hasChildren) {
                    return (
                        <ListItemButton
                            key={groupKey}
                            component={NavLink}
                            to={item.to}
                            onClick={onNavigate}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                "&.active": {
                                    bgcolor: "rgba(56,189,248,0.12)",
                                    border: "1px solid rgba(56,189,248,0.25)",
                                },
                                "&:hover": {
                                    bgcolor: "rgba(148,163,184,0.10)",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    ml: 1.5,
                                    color: "text.primary",
                                    justifyContent: "center",
                                    width: 36,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>

                            <ListItemText
                                primary={item.label}
                                sx={{
                                    opacity: collapsed ? 0 : 1,
                                    transition: "opacity 150ms ease",
                                    whiteSpace: "nowrap",
                                }}
                            />
                        </ListItemButton>
                    );
                }

                return (
                    <Box key={groupKey}>
                        <ListItemButton
                            onClick={() => !collapsed && toggleGroup(groupKey)}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                bgcolor:
                                    isOpen && !collapsed
                                        ? "rgba(148,163,184,0.06)"
                                        : "transparent",
                                "&:hover": {
                                    bgcolor: "rgba(148,163,184,0.10)",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    ml: 1.5,
                                    color: "text.primary",
                                    justifyContent: "center",
                                    width: 36,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>

                            <ListItemText
                                primary={item.label}
                                sx={{
                                    opacity: collapsed ? 0 : 1,
                                    transition: "opacity 150ms ease",
                                    whiteSpace: "nowrap",
                                }}
                            />

                            {!collapsed &&
                                (isOpen ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>

                        <Collapse
                            in={!collapsed && isOpen}
                            timeout="auto"
                            unmountOnExit
                        >
                            <List disablePadding sx={{ pb: 0.5 }}>
                                {item.children.map((child) => (
                                    <ListItemButton
                                        key={child.to}
                                        component={NavLink}
                                        to={child.to}
                                        onClick={onNavigate}
                                        sx={{
                                            borderRadius: 2,
                                            mx: 1,
                                            my: 0.25,
                                            pr: 5,
                                            "&.active": {
                                                bgcolor:
                                                    "rgba(56,189,248,0.10)",
                                                border: "1px solid rgba(56,189,248,0.18)",
                                            },
                                            "&:hover": {
                                                bgcolor:
                                                    "rgba(148,163,184,0.08)",
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                ml: 1.5,
                                                color: "rgba(229,231,235,0.75)",
                                                width: 18,
                                                justifyContent: "center",
                                            }}
                                        >
                                            <FiberManualRecord
                                                sx={{ fontSize: 8 }}
                                            />
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={child.label}
                                            primaryTypographyProps={{
                                                sx: {
                                                    fontSize: 13,
                                                    color: "rgba(229,231,235,0.85)",
                                                },
                                            }}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Collapse>
                    </Box>
                );
            })}
        </List>
    );
}
