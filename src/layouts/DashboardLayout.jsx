import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
    AppBar,
    Box,
    Collapse,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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
const COLLAPSED_WIDTH = 0;

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
    { label: "إضافة فاتورة لمجهول", to: "/invoices/new", icon: <Add /> },
    { label: "الدفعات والحساب", to: "/payments", icon: <Add /> },
    { label: "التسجيلات", to: "/Records", icon: <Notes /> },
    { label: "المهمام", to: "/Tasks", icon: <Task /> },
];

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);

    const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

    return (
        <AddressesProvider>
            <PaymentMethodsProvider>
                <ProductsProvider>
                    <UsersProvider>
                        <UserLocationProvider>
                            <Box sx={{ display: "flex", direction: "rtl" }}>
                                <CssBaseline />

                                {/* Top Bar */}
                                <AppBar
                                    position="fixed"
                                    sx={{
                                        bgcolor: "#0b1220",
                                        borderBottom: "1px solid #1e293b",
                                        zIndex: (theme) =>
                                            theme.zIndex.drawer + 1,
                                    }}
                                >
                                    <Toolbar sx={{ gap: 1 }}>
                                        {/* زرار فتح/قفل السايدبار (يمين) */}
                                        <IconButton
                                            onClick={() =>
                                                setCollapsed((p) => !p)
                                            }
                                            sx={{ color: "text.primary" }}
                                            edge="start"
                                        >
                                            <MenuIcon />
                                        </IconButton>

                                        <Box sx={{ flex: 1 }} />

                                        {/* Logo / Title */}
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

                                {/* Right Sidebar (Drawer) */}
                                <Drawer
                                    variant="permanent"
                                    anchor="right"
                                    sx={{
                                        width: drawerWidth,
                                        flexShrink: 0,
                                        "& .MuiDrawer-paper": {
                                            width: drawerWidth,
                                            boxSizing: "border-box",
                                            bgcolor: "#0b1220",
                                            borderLeft: "1px solid #1e293b",
                                            overflow: "hidden", // ✅ مهم: امنع الاسكرول على الورقة نفسها
                                            transition: "width 200ms ease",
                                            height: "100vh", // ✅ ثبت الارتفاع
                                            display: "flex",
                                            flexDirection: "column",
                                        },
                                    }}
                                >
                                    {/* space for AppBar */}
                                    <Toolbar />

                                    {/* ✅ ده اللي هيعمل scroll لما العناصر تكتر */}
                                    <Box
                                        sx={{
                                            px: 1,
                                            flex: 1,
                                            overflowY: "auto", // ✅ يظهر بس عند الحاجة
                                            overflowX: "hidden",
                                            pb: 1,
                                            direction: "ltr",
                                            // ✅ Scrollbar شيك ومناسب للدارك (هيظهر فقط لو فيه overflow)
                                            "&::-webkit-scrollbar": {
                                                width: "5px",
                                            },
                                            "&::-webkit-scrollbar-track": {
                                                background: "transparent",
                                            },
                                            "&::-webkit-scrollbar-thumb": {
                                                backgroundColor:
                                                    "rgba(148,163,184,0.28)", // رمادي مزرق هادي
                                                borderRadius: "10px",
                                            },
                                            "&::-webkit-scrollbar-thumb:hover":
                                                {
                                                    backgroundColor:
                                                        "rgba(148,163,184,0.45)",
                                                },

                                            // Firefox
                                            scrollbarWidth: "thin",
                                            scrollbarColor:
                                                "rgba(148,163,184,0.28) transparent",
                                        }}
                                    >
                                        <SidebarMenu
                                            navItems={navItems}
                                            collapsed={collapsed}
                                        />
                                        <ListItemButton
                                            component={NavLink}
                                            onClick={() => {
                                                logout();
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
                                                <Logout></Logout>
                                            </ListItemIcon>

                                            <ListItemText
                                                primary="تسجيل الخروج"
                                                sx={{
                                                    opacity: collapsed ? 0 : 1,
                                                    transition:
                                                        "opacity 150ms ease",
                                                    whiteSpace: "nowrap",
                                                }}
                                            />
                                        </ListItemButton>
                                    </Box>
                                </Drawer>

                                {/* Main Content */}
                                <Box
                                    component="main"
                                    sx={{
                                        flexGrow: 1,
                                        minHeight: "100vh",
                                        bgcolor: "#0f172a",
                                        p: 3,
                                        // مهم: نزق المحتوى عشان السايدبار على اليمين
                                        mr: `$20px`,
                                        transition: "margin-right 200ms ease",
                                    }}
                                >
                                    {/* space for AppBar */}
                                    <Toolbar />

                                    {/* هنا الـ Outlet بتاعك */}
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

function SidebarMenu({ navItems, collapsed }) {
    const [openMap, setOpenMap] = useState({ accounts: true }); // افتح/اقفل مجموعات

    const toggleGroup = (key) => {
        setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <List sx={{ pt: 1, direction: "rtl" }}>
            {navItems.map((item, idx) => {
                const hasChildren =
                    Array.isArray(item.children) && item.children.length > 0;

                // اعمل key ثابت للجروب
                const groupKey = item.to || item.label || String(idx);
                const isOpen = !!openMap[groupKey];

                if (!hasChildren) {
                    // عنصر عادي (NavLink)
                    return (
                        <ListItemButton
                            key={groupKey}
                            component={NavLink}
                            to={item.to}
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

                // عنصر Group (Button يفتح/يقفل)
                return (
                    <Box key={groupKey}>
                        <ListItemButton
                            onClick={() => !collapsed && toggleGroup(groupKey)} // لو collapsed ما نفتحش sub
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

                            {/* السهم */}
                            {!collapsed &&
                                (isOpen ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>

                        {/* Sub Items */}
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
                                        sx={{
                                            borderRadius: 2,
                                            mx: 1,
                                            my: 0.25,
                                            pr: 5, // indent من اليمين (RTL)
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
